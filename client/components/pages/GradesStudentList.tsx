'use client'

import { CheckCircle, ClipboardEdit, User, UserCheck, UserX,XCircle } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/client/components/ui/card'
import { Checkbox } from '@/client/components/ui/checkbox'
import { Input } from '@/client/components/ui/input'
import { Label } from '@/client/components/ui/label'

type GradeEntry = {
  student: string
  studentName?: string
  studentGender?: string
  value: number
  isAbsent: boolean
  comment: string
}

interface GradesStudentListProps {
  gradeEntries: GradeEntry[]
  selectedSession: string
  getStudentRecord: (studentId: string) => GradeEntry | undefined
  handleGradeUpdate: (
    studentId: string,
    field: 'value' | 'isAbsent' | 'comment',
    value: string | number | boolean,
  ) => void
}

export function GradesStudentList({
  gradeEntries,
  selectedSession,
  getStudentRecord,
  handleGradeUpdate,
}: GradesStudentListProps) {
  // Fonction pour normaliser la saisie des notes
  const normalizeGradeInput = (value: string): number => {
    // Nettoyer la valeur (supprimer les espaces)
    const cleanValue = value.trim()

    // Si vide, retourner 0
    if (cleanValue === '') return 0

    // Remplacer la virgule par un point pour parseFloat
    const normalizedValue = cleanValue.replace(',', '.')

    // Vérifier si c'est un nombre valide
    const numValue = parseFloat(normalizedValue)

    if (isNaN(numValue)) return 0

    // Limiter à 20 maximum et arrondir à 1 décimale
    const limitedValue = Math.min(numValue, 20)
    const result = Math.round(limitedValue * 10) / 10

    // Debug log temporaire
    console.log(`Input: "${value}" → Clean: "${cleanValue}" → Normalized: "${normalizedValue}" → Number: ${numValue} → Result: ${result}`)

    return result
  }

  // Fonction pour formater l'affichage de la note
  const formatGradeDisplay = (value: number): string => {
    if (value === 0) return ''

    // S'assurer que c'est un nombre valide
    const numValue = parseFloat(value.toString())
    if (isNaN(numValue)) return ''

    // Formater avec une virgule pour l'affichage français
    return numValue.toString().replace('.', ',')
  }

  // Fonction pour obtenir l'icône selon le genre
  const getGenderIcon = (gender: string | undefined) => {
    switch (gender?.toLowerCase()) {
    case 'masculin':
      return <UserCheck className="w-5 h-5" />
    case 'feminin':
      return <UserX className="w-5 h-5" />
    default:
      return <User className="w-5 h-5" />
    }
  }

  if (gradeEntries.length > 0) {
    return (
      <Card className="shadow-lg bg-background hover:border-primary transition-all duration-200">
        <CardHeader className="pb-3 border-b bg-primary/5">
          <CardTitle className="text-lg text-foreground flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary"></div>
            Saisie des notes
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          {/* Résumé des statistiques */}
          <div className="mb-6 p-4 bg-muted/30 rounded-lg">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {gradeEntries.length}
                </div>
                <div className="text-sm text-muted-foreground">Total élèves</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {gradeEntries.filter((e) => !e.isAbsent && e.value > 0).length}
                </div>
                <div className="text-sm text-muted-foreground">Notés</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">
                  {gradeEntries.filter((e) => e.isAbsent).length}
                </div>
                <div className="text-sm text-muted-foreground">Absents</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {gradeEntries.filter((e) => !e.isAbsent && e.value === 0).length}
                </div>
                <div className="text-sm text-muted-foreground">A noter</div>
              </div>
            </div>

            {/* Info sur la saisie des notes */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>Conseils de saisie :</strong> Vous pouvez utiliser la virgule (,) ou le point (.) pour les décimales.
                Les notes sont automatiquement limitées à 20 maximum. Laissez le champ vide pour une note de 0.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {gradeEntries.map((student, index) => {
              const record = getStudentRecord(student.student)
              const isGraded = !record?.isAbsent && (record?.value || 0) > 0
              const isAbsent = record?.isAbsent || false

              return (
                <div
                  key={student.student}
                  className={`p-4 border rounded-[--radius] transition-all duration-200 ${
                    isAbsent
                      ? 'border-orange-200 bg-orange-50'
                      : isGraded
                        ? 'border-green-200 bg-green-50'
                        : 'border-border bg-input hover:border-primary'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center
                        text-primary-foreground font-semibold text-sm ${
                isAbsent
                  ? 'bg-orange-500'
                  : isGraded
                    ? 'bg-green-500'
                    : 'bg-primary'
                }`}>
                        {isAbsent ? <XCircle className="w-5 h-5" /> : getGenderIcon(student.studentGender)}
                      </div>
                      <div>
                        <h3 className="font-medium text-foreground">
                          {student.studentName || student.student}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Élève #{index + 1}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        isAbsent
                          ? 'bg-orange-100 text-orange-700'
                          : isGraded
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-700'
                      }`}>
                        {isAbsent ? 'Absent' : isGraded ? 'Noté' : 'A noter'}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {/* Absence */}
                    <div className="flex items-center space-x-3">
                      <Checkbox
                        id={`absent-${student.student}`}
                        checked={isAbsent}
                        onCheckedChange={(checked) =>
                          handleGradeUpdate(student.student, 'isAbsent', checked as boolean)
                        }
                        className="data-[state=checked]:bg-orange-500 data-[state=checked]:border-orange-500"
                      />
                      <Label
                        htmlFor={`absent-${student.student}`}
                        className="text-sm font-medium cursor-pointer"
                      >
                        Élève absent
                      </Label>
                    </div>

                    {/* Note (désactivée si absent) */}
                    <div className="flex items-center gap-4">
                      <Label className="text-sm text-foreground font-medium min-w-20">
                        Note (/20):
                      </Label>
                      <Input
                        type="text"
                        value={formatGradeDisplay(record?.value || 0)}
                        onChange={(e) => {
                          const inputValue = e.target.value
                          console.log('Input value:', inputValue, 'Type:', typeof inputValue)

                          if (inputValue === '') {
                            handleGradeUpdate(student.student, 'value', 0)
                          } else {
                            // Nettoyer et normaliser
                            const cleanValue = inputValue.trim().replace(',', '.')

                            // Gérer le cas où l'utilisateur tape juste une virgule/point ou termine par un point
                            if (cleanValue === '.' || cleanValue.endsWith('.')) {
                              return // Ne rien faire, attendre plus de saisie
                            }

                            // Vérifier si c'est un nombre valide
                            const numValue = parseFloat(cleanValue)
                            console.log('Clean value:', cleanValue, 'Number:', numValue)

                            if (!isNaN(numValue)) {
                              const finalValue = Math.min(numValue, 20)
                              console.log('Final value:', finalValue)
                              handleGradeUpdate(student.student, 'value', finalValue)
                            }
                          }
                        }}
                        disabled={isAbsent}
                        className={`w-24 bg-background transition-colors ${
                          isAbsent
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:border-primary focus:border-primary focus:ring-ring'
                        }`}
                        placeholder="0-20"
                        maxLength={5}
                      />
                      {isGraded && (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      )}
                    </div>

                    {/* Commentaire */}
                    <div className="flex items-center gap-4">
                      <Label className="text-sm text-foreground font-medium min-w-20">
                        Commentaire:
                      </Label>
                      <Input
                        type="text"
                        value={record?.comment || ''}
                        onChange={(e) =>
                          handleGradeUpdate(student.student, 'comment', e.target.value)
                        }
                        disabled={isAbsent}
                        className={`flex-1 bg-background transition-colors ${
                          isAbsent
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:border-primary focus:border-primary focus:ring-ring'
                        }`}
                        placeholder="Commentaire optionnel..."
                      />
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (selectedSession) {
    return (
      <div className="text-center py-16 bg-gradient-to-br from-white to-slate-50/50
        rounded-lg border border-slate-200 shadow-sm mt-6">
        <div className="text-slate-400 mb-4">
          <ClipboardEdit className="w-16 h-16 mx-auto opacity-50" />
        </div>
        <h3 className="text-xl font-semibold text-slate-800 mb-2">
          Aucun élève dans cette classe
        </h3>
        <p className="text-slate-500 max-w-md mx-auto">
          Cette session ne contient pas d'élèves à noter.
        </p>
      </div>
    )
  }

  return null
}
