'use client'

import { useState } from 'react'
import { generateKTP } from '@/lib/ktp-generator'

export default function KTPPage() {
  const [subject, setSubject] = useState('')
  const [grade, setGrade] = useState('')
  const [hours, setHours] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!subject.trim() || !grade.trim() || !hours.trim()) {
      alert('Пожалуйста, заполните все поля')
      return
    }

    if (isNaN(Number(hours)) || Number(hours) <= 0) {
      alert('Количество часов должно быть положительным числом')
      return
    }

    setLoading(true)
    setResult('')
    
    try {
      const response = await generateKTP({ subject, grade, hours })
      setResult(response)
      alert('КТП успешно сгенерировано!')
    } catch (error) {
      console.error(error)
      alert('Ошибка генерации КТП. Пожалуйста, попробуйте снова.')
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([result], { type: 'application/msword' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `КТП_${subject}_${grade}_класс.doc`
    link.click()
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Генератор КТП и конспектов</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Предмет</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Класс</label>
          <input
            type="text"
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block mb-1">Количество часов</label>
          <input
            type="number"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Генерация...</span>
            </div>
          ) : (
            'Сгенерировать КТП'
          )}
        </button>
      </form>

      {result && (
        <div className="mt-6">
          <button
            onClick={handleDownload}
            className="bg-green-500 text-white p-2 rounded hover:bg-green-600"
          >
            Скачать КТП в Word
          </button>
        </div>
      )}
    </div>
  )
}
