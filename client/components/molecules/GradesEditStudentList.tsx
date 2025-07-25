'use client'

import { CheckCircle, XCircle } from 'lucide-react'

import { GenderDisplay } from '@/client/components/atoms/GenderDisplay'
import { Card, CardContent, CardHeader, CardTitle } from '@/client/components/ui/card'
import { Checkbox } from '@/client/components/ui/checkbox'
import { Input } from '@/client/components/ui/input'
import { Label } from '@/client/components/ui/label'
import { GradeRecordWithUser, Student } from '@/types/grades'

interface EditStudentListProps {
  students: Student[]
  getStudentRecord: (studentId: string) => GradeRecordWithUser | undefined
  handleGradeUpdate: (
    studentId: string,
    field: keyof Omit<GradeRecordWithUser, 'users'>,
    value: number | string | boolean,
  ) => void
}

export function EditStudentList({
  students,
  getStudentRecord,
  handleGradeUpdate,
}: EditStudentListProps) {
  if (students.length === 0) {
    return (
      <Card className="bg-background border-border">
        <CardContent className="text-center py-10">
          <div className="text-muted-foreground mb-3">
            <svg
              className="w-12 h-12 mx-auto opacity-50"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414
                5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-1">
            Aucun élève à afficher
          </h3>
          <p className="text-muted-foreground">
            Aucune donnée d&apos;élève n&apos;est disponible pour cette évaluation.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-background border-border">
      <CardHeader className="pb-4 border-b border-border">
        <CardTitle className="text-xl font-semibold text-foreground">
          Saisie des notes
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {/* Résumé des statistiques */}
        <div className="mb-6 p-4 bg-muted/20 rounded-lg border border-border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-foreground">
                {students.length}
              </div>
              <div className="text-sm font-extrabold text-muted-foreground">Total élèves</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-success">
                {students.filter((s) => {
                  const record = getStudentRecord(s.id)
                  return !record?.is_absent && (record?.value || 0) > 0
                }).length}
              </div>
              <div className="text-sm font-extrabold text-muted-foreground">Notés</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-warning">
                {students.filter((s) => {
                  const record = getStudentRecord(s.id)
                  return record?.is_absent
                }).length}
              </div>
              <div className="text-sm font-extrabold text-muted-foreground">Absents</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-info">
                {students.filter((s) => {
                  const record = getStudentRecord(s.id)
                  return !record?.is_absent && (record?.value || 0) === 0
                }).length}
              </div>
              <div className="text-sm font-extrabold text-muted-foreground">A noter</div>
            </div>
          </div>

          {/* Info sur la saisie des notes */}
          <div className="mt-4 p-3 bg-info border border-info/10 rounded-lg">
            <p className="text-md text-info-foreground">
              💡 <strong>Conseils de saisie :</strong> Vous pouvez utiliser la virgule (,)
              ou le point (.) pour les décimales.
              Les notes sont automatiquement limitées à 20 maximum. Laissez le champ
              vide pour une note de 0.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {students.map((student) => {
            const record = getStudentRecord(student.id)
            const isGraded = !record?.is_absent && (record?.value || 0) > 0
            const isAbsent = record?.is_absent || false
            return (
              <div
                key={student.id}
                className={`p-4 border rounded-lg transition-colors ${
                  isAbsent
                    ? 'border-warning bg-warning/5'
                    : isGraded
                      ? 'border-success bg-success/5'
                      : 'border-border bg-background hover:border-primary'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {isAbsent ? (
                      <div className="w-10 h-10 rounded-full bg-warning flex
                      items-center justify-center">
                        <XCircle className="w-5 h-5 text-warning-foreground" />
                      </div>
                    ) : (
                      <GenderDisplay gender={student.gender} />
                    )}
                    <div>
                      <h3 className="font-medium text-foreground">
                        {student.firstname} {student.lastname}
                      </h3>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isAbsent
                        ? 'bg-warning/20 text-warning'
                        : isGraded
                          ? 'bg-success/20 text-success'
                          : 'bg-muted text-muted-foreground'
                    }`}>
                      {isAbsent ? 'Absent' : isGraded ? 'Noté' : 'A noter'}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Absence */}
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={`absent-${student.id}`}
                      checked={isAbsent}
                      onCheckedChange={(checked) =>
                        handleGradeUpdate(student.id, 'is_absent', checked as boolean)
                      }
                      className="data-[state=checked]:bg-warning
                      data-[state=checked]:border-warning"
                    />
                    <Label
                      htmlFor={`absent-${student.id}`}
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
                      type="number"
                      min="0"
                      max="20"
                      step="0.1"
                      value={record?.value && record.value > 0 ? record.value : ''}
                      onChange={(e) => {
                        const value = e.target.value === '' ? 0 : parseFloat(e.target.value)
                        handleGradeUpdate(student.id, 'value', value)
                      }}
                      disabled={isAbsent}
                      className={`w-24 bg-background border-border transition-colors ${
                        isAbsent
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:border-primary focus:border-primary'
                      }`}
                      placeholder="0-20"
                    />
                    {isGraded && (
                      <CheckCircle className="w-5 h-5 text-success" />
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
                        handleGradeUpdate(student.id, 'comment', e.target.value)
                      }
                      disabled={isAbsent}
                      className={`flex-1 bg-background border-border transition-colors ${
                        isAbsent
                          ? 'opacity-50 cursor-not-allowed'
                          : 'hover:border-primary focus:border-primary'
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
