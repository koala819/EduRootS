'use client'

import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useReducer,
  useTransition,
} from 'react'

import { useToast } from '@/client/hooks/use-toast'
import {
  getStudentAttendance,
  getStudentBehavior,
  getStudentGrade,
  refreshEntityStats,
  refreshGlobalStats,
  refreshTeacherStudentsStats as refreshTeacherStudentsStatsAction,
  updateStudentStats,
  updateTeacherStats,
} from '@/server/actions/api/stats'
import {
  EntityStats,
  GlobalStats,
  isStudentStats,
  isTeacherStats,
} from '@/types/stats'
import { StudentStatsPayload, TeacherStatsPayload } from '@/types/stats-payload'

interface StatsState {
  globalStats: GlobalStats | null
  entityStats: EntityStats[]
  isLoading: boolean
  error: string | null
}

type StatsAction =
  | { type: 'SET_GLOBAL_STATS'; payload: GlobalStats }
  | { type: 'SET_ENTITY_STATS'; payload: EntityStats[] }
  | { type: 'UPDATE_ENTITY_STATS'; payload: EntityStats }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }

export function statsReducer(
  state: StatsState,
  action: StatsAction,
): StatsState {
  switch (action.type) {
  case 'SET_GLOBAL_STATS':
    return { ...state, globalStats: action.payload }
  case 'SET_ENTITY_STATS':
    return { ...state, entityStats: action.payload }
  case 'UPDATE_ENTITY_STATS':
    return {
      ...state,
      entityStats: state.entityStats.map((stat) => {
        if (stat && typeof stat === 'object' && 'userId' in stat) {
          const statWithUserId = stat as { userId: string }
          if (
            statWithUserId.userId ===
              (action.payload as { userId: string }).userId
          ) {
            return action.payload
          }
        }
        return stat
      }),
    }
  case 'SET_LOADING':
    return { ...state, isLoading: action.payload }
  case 'SET_ERROR':
    return { ...state, error: action.payload }
  default:
    return state
  }
}

interface StatsContextType {
  refreshEntityStats: () => Promise<void>
  refreshTeacherStudentsStats: () => Promise<any>
  updateStudentStats: (id: string, stats: StudentStatsPayload) => Promise<void>
  updateTeacherStats: (id: string, stats: TeacherStatsPayload) => Promise<void>
  refreshGlobalStats: () => Promise<void>
  getStudentAttendance: (studentId: string) => Promise<any>
  getStudentBehavior: (studentId: string) => Promise<any>
  getStudentGrade: (studentId: string) => Promise<any>

  // État
  globalStats: GlobalStats | null
  entityStats: EntityStats[]
  studentStats: EntityStats[]
  teacherStats: EntityStats[]
  isLoading: boolean
  isPending: boolean
  error: string | null
}

export const StatsContext = createContext<StatsContextType | null>(null)

interface StatsProviderProps {
  children: ReactNode
  initialEntityStats: EntityStats[]
  initialGlobalStats: GlobalStats
}

export const StatsProvider = ({
  children,
  initialEntityStats,
  initialGlobalStats,
}: StatsProviderProps) => {
  const { toast } = useToast()
  const [isPending, startTransition] = useTransition()

  // Initialiser l'état avec les données du serveur
  const initialState: StatsState = {
    globalStats: initialGlobalStats,
    entityStats: initialEntityStats,
    isLoading: false,
    error: null,
  }

  const [state, dispatch] = useReducer(statsReducer, initialState)

  // Filtrer les statistiques par type
  const studentStats = useMemo(() => {
    if (!Array.isArray(state.entityStats)) {
      return []
    }
    return state.entityStats.filter((stat) => {
      if (stat && typeof stat === 'object' && !Array.isArray(stat)) {
        return isStudentStats(stat as unknown as EntityStats)
      }
      return false
    })
  }, [state.entityStats])

  const teacherStats = useMemo(() => {
    if (!Array.isArray(state.entityStats)) {
      return []
    }
    return state.entityStats.filter((stat) => {
      if (stat && typeof stat === 'object' && !Array.isArray(stat)) {
        return isTeacherStats(stat as unknown as EntityStats)
      }
      return false
    })
  }, [state.entityStats])

  const handleError = useCallback(
    (error: Error, customMessage?: string) => {
      console.error('Stats Error:', error)
      const errorMessage = customMessage ?? error.message
      dispatch({ type: 'SET_ERROR', payload: errorMessage })
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: errorMessage,
        duration: 5000,
      })
    },
    [toast],
  )

  const handleRefreshEntityStats = useCallback(async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })

      // Utiliser Server Action
      startTransition(async () => {
        const response = await refreshEntityStats()

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to fetch attendance data')
        }

        dispatch({
          type: 'SET_ENTITY_STATS',
          payload: response.data as EntityStats[],
        })
      })
    } catch (error) {
      handleError(
        error as Error,
        'Erreur lors de la récupération des statistiques des entités',
      )
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [handleError])

  const handleRefreshTeacherStudentsStats =
    useCallback(async (): Promise<any> => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true })

        // Appeler la fonction directement pour obtenir la réponse
        const response = await refreshTeacherStudentsStatsAction()

        if (!response.success || !response.data) {
          throw new Error(
            response.message || 'Failed to fetch teacher students stats',
          )
        }

        // Le backend retourne maintenant { studentStats, studentsUpdated }
        // On met à jour entityStats avec studentStats
        if (response.data.studentStats && Array.isArray(response.data.studentStats)) {
          startTransition(() => {
            dispatch({
              type: 'SET_ENTITY_STATS',
              payload: response.data.studentStats as EntityStats[],
            })
          })
        }

        // Retourner la réponse complète pour que le composant puisse accéder à studentsUpdated
        return response
      } catch (error) {
        handleError(
          error as Error,
          'Erreur lors de la récupération des statistiques des élèves du professeur',
        )
        throw error
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }, [handleError])

  const handleUpdateStudentStats = useCallback(
    async (id: string, statsData: StudentStatsPayload): Promise<void> => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true })

        // Utiliser Server Action avec transition UI
        startTransition(async () => {
          const response = await updateStudentStats(id, statsData)

          if (!response.success || !response.data) {
            throw new Error(
              response.message || 'Failed to fetch attendance data',
            )
          }

          dispatch({
            type: 'UPDATE_ENTITY_STATS',
            payload: response.data as EntityStats,
          })
          toast({ title: 'Succès', description: 'Statistiques mises à jour' })
        })
      } catch (error) {
        handleError(
          error as Error,
          'Erreur lors de la mise à jour des statistiques',
        )
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    },
    [handleError, toast],
  )

  const handleUpdateTeacherStats = useCallback(
    async (id: string, statsData: TeacherStatsPayload): Promise<void> => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true })

        // Utiliser Server Action avec transition UI
        startTransition(async () => {
          const response = await updateTeacherStats(id, statsData)

          if (!response.success || !response.data) {
            throw new Error(
              response.message || 'Failed to fetch attendance data',
            )
          }

          dispatch({
            type: 'UPDATE_ENTITY_STATS',
            payload: response.data as EntityStats,
          })
          toast({ title: 'Succès', description: 'Statistiques mises à jour' })
        })
      } catch (error) {
        handleError(
          error as Error,
          'Erreur lors de la mise à jour des statistiques',
        )
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    },
    [handleError, toast],
  )

  const handleRefreshGlobalStats = useCallback(async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })

      // Utiliser Server Action
      startTransition(async () => {
        const response = await refreshGlobalStats()

        if (!response.success || !response.data) {
          throw new Error(response.message || 'Failed to fetch attendance data')
        }

        dispatch({
          type: 'SET_GLOBAL_STATS',
          payload: response.data as GlobalStats,
        })
      })
    } catch (error) {
      handleError(
        error as Error,
        'Erreur lors de la récupération des statistiques globales',
      )
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [handleError])

  const handleGetStudentAttendance = useCallback(
    async (studentId: string) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true })
        return await getStudentAttendance(studentId)
      } catch (error) {
        handleError(
          error as Error,
          `Erreur lors de la récupération des présences pour l'étudiant ${studentId}`,
        )
        return null
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    },
    [handleError],
  )

  const handleGetStudentBehavior = useCallback(
    async (studentId: string) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true })
        return await getStudentBehavior(studentId)
      } catch (error) {
        handleError(
          error as Error,
          `Erreur lors de la récupération des comportements pour l'étudiant ${studentId}`,
        )
        return null
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    },
    [handleError],
  )

  const handleGetStudentGrade = useCallback(
    async (studentId: string) => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true })
        return await getStudentGrade(studentId)
      } catch (error) {
        handleError(
          error as Error,
          `Erreur lors de la récupération des notes pour l'étudiant ${studentId}`,
        )
        return null
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    },
    [handleError],
  )

  const value = useMemo(
    () => ({
      ...state,
      refreshEntityStats: handleRefreshEntityStats,
      refreshTeacherStudentsStats: handleRefreshTeacherStudentsStats,
      updateStudentStats: handleUpdateStudentStats,
      updateTeacherStats: handleUpdateTeacherStats,
      refreshGlobalStats: handleRefreshGlobalStats,
      getStudentAttendance: handleGetStudentAttendance,
      getStudentBehavior: handleGetStudentBehavior,
      getStudentGrade: handleGetStudentGrade,
      studentStats,
      teacherStats,
      isPending,
    }),
    [
      state,
      handleUpdateStudentStats,
      handleUpdateTeacherStats,
      handleRefreshGlobalStats,
      handleRefreshEntityStats,
      handleRefreshTeacherStudentsStats,
      handleGetStudentAttendance,
      handleGetStudentBehavior,
      handleGetStudentGrade,
      studentStats,
      teacherStats,
      isPending,
    ],
  )

  return <StatsContext.Provider value={value}>{children}</StatsContext.Provider>
}

export const useStats = () => {
  const context = useContext(StatsContext)
  if (!context) {
    throw new Error('useStats must be used within a StatsProvider')
  }
  return context
}
