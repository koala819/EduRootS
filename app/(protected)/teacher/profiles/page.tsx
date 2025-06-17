'use client'

import { BarChart, Calendar, LogOut, PenSquare, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { useStats } from '@/client/context/stats'
import { useToast } from '@/client/hooks/use-toast'
import { createClient } from '@/client/utils/supabase'

const ProfilePage = () => {
  const router = useRouter()
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(0)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const { toast } = useToast()
  const { refreshTeacherStudentsStats, refreshGlobalStats } = useStats()

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true)
      const supabase = createClient()
      const { data: { user }, error } = await supabase.auth.getUser()
      if (user && !error) {
        setUser(user)
      } else {
        setUser(null)
      }
      setLoading(false)
    }
    fetchUser()
  }, [])

  async function logoutHandler() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = process.env.NEXT_PUBLIC_CLIENT_URL || '/'
  }

  const actions = [
    {
      icon: <Users className="h-10 w-10" />,
      title: 'Détail des élèves',
      onClick: () => {
        handleNavClick('/teacher/profiles/classroom')
      },
    },
    {
      icon: <PenSquare className="h-10 w-10" />,
      title: 'Devoirs & Contrôles',
      onClick: () => {
        handleNavClick('/teacher/profiles/grades')
      },
    },
    {
      icon: <Calendar className="h-10 w-10" />,
      title: 'Emploi du temps',
      onClick: () => {
        handleNavClick('/teacher/profiles/edit')
      },
    },
    {
      icon: <BarChart className="h-10 w-10" />,
      title: 'Mettre à jour les statistiques',
      onClick: async () => {
        const now = Date.now()
        const timeSinceLastUpdate = now - lastUpdateTime
        const MIN_UPDATE_INTERVAL = 1000 * 60 * 30 // 30 minutes

        if (timeSinceLastUpdate < MIN_UPDATE_INTERVAL) {
          toast({
            variant: 'destructive',
            title: 'Mise à jour impossible',
            description: `Veuillez attendre ${Math.ceil(
              (MIN_UPDATE_INTERVAL - timeSinceLastUpdate) / 1000 / 60,
            )} minutes avant la prochaine mise à jour`,
            duration: 3000,
          })
          return
        }

        try {
          toast({
            title: 'Mise à jour en cours',
            description: 'Veuillez patienter...',
            duration: 3000,
          })

          await Promise.all([
            refreshTeacherStudentsStats(true),
            refreshGlobalStats(),
          ])

          setLastUpdateTime(now)

          toast({
            variant: 'success',
            title: 'Mise à jour terminée',
            description: 'Les statistiques ont été actualisées avec succès',
            duration: 3000,
          })
        } catch (error) {
          console.error('Erreur lors de la mise à jour:', error)
          toast({
            variant: 'destructive',
            title: 'Erreur',
            description: 'Une erreur est survenue lors de la mise à jour des statistiques',
            duration: 3000,
          })
        }
      },
    },
  ]

  function handleNavClick(href: string) {
    router.push(href)
  }

  if (loading) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 bg-gray-500 rounded-full animate-ping"></div>
          <div
            className="w-2 h-2 bg-gray-500 rounded-full animate-ping"
            style={{ animationDelay: '0.2s' }}
          ></div>
          <div
            className="w-2 h-2 bg-gray-500 rounded-full animate-ping"
            style={{ animationDelay: '0.4s' }}
          ></div>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="h-[calc(100vh-8rem)] flex items-center justify-center">
        <div className="text-gray-500">Non authentifié</div>
      </div>
    )
  }

  return (
    <>
      <section className="p-2 text-center w-full">
        <h1 className="text-2xl font-bold text-gray-900 space-x-4">
          {user.user_metadata?.firstname + ' ' + user.user_metadata?.lastname}
        </h1>
        <p className="text-gray-500">Professeur de Al&apos;Ihsane</p>
      </section>
      <section className="w-full flex-1 flex flex-col justify-center md:p-4 p-2">
        <div className="flex flex-col gap-2 h-[77vh] md:grid md:grid-cols-2 w-full
         md:h-[86vh] md:gap-4">
          {actions.map((item) => {
            return (
              <button
                key={item.title}
                onClick={item.onClick}
                className={`
                  flex flex-col items-center justify-center rounded-2xl shadow-lg
                  w-full h-full text-xl font-semibold transition-all
                  bg-white text-[#375073] hover:bg-blue-50
                `}
              >
                {item.icon}
                <span className="mt-3 text-center px-2">{item.title}</span>
              </button>
            )
          })}
          <button
            key="Déconnexion"
            onClick={logoutHandler}
            className={`
              flex flex-col items-center justify-center rounded-2xl shadow-lg
              w-full h-full text-xl font-semibold transition-all
              bg-red-100 text-red-600 hover:bg-red-200 col-span-2
            `}
            style={{ minHeight: '120px' }}
          >
            <LogOut className="h-10 w-10 text-red-600" />
            <span className="mt-3 text-center px-2">Déconnexion</span>
          </button>
        </div>
      </section>
    </>
  )
}

export default ProfilePage
