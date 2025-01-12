const DEEPSEEK_API_KEY = 'sk-6e0db414005645d6be74a7c33206a5c4'

interface GenerateKTPParams {
  subject: string
  grade: string
  hours: string
}

export async function generateKTP(params: GenerateKTPParams): Promise<string> {
  const { subject, grade, hours } = params
  
  const prompt = `Создай календарно-тематическое планирование для предмета ${subject} для ${grade} класса на ${hours} часов. 
  Включи следующие разделы:
  1. Тема урока
  2. Тип урока
  3. Цели и задачи
  4. Основные понятия
  5. Планируемые результаты
  6. Формы организации учебной деятельности
  7. Домашнее задание
  
  Оформи в виде таблицы.`

  try {
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      throw new Error(`Ошибка API: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content
    
    // Преобразуем результат в формат Word с сохранением таблиц
    const wordContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office"
      xmlns:w="urn:schemas-microsoft-com:office:word"
      xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta charset="UTF-8">
        <title>КТП ${subject} ${grade} класс</title>
        <style>
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            border: 1px solid #000;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
          }
        </style>
      </head>
      <body>
        <h1>Календарно-тематическое планирование</h1>
        <h2>Предмет: ${subject}</h2>
        <h3>Класс: ${grade}</h3>
        <h3>Количество часов: ${hours}</h3>
        ${content
          .replace(/\|/g, '</td><td>')
          .replace(/\n/g, '</tr><tr>')
          .replace(/<\/td><td>\n<\/tr><tr>/g, '</tr></table><table><tr>')
          .replace(/<\/td><td><\/tr><tr>/g, '</tr></table><table><tr>')
          .replace(/<\/td><td><\/tr><tr><td>/g, '</tr></table><table><tr><td>')
          .replace(/^<tr>/, '<table><tr>')
          .replace(/<\/tr>$/, '</tr></table>')
          .replace(/<\/td><td><\/tr><tr><td>/g, '</tr></table><table><tr><td>')
        }
      </body>
      </html>
    `

    return wordContent
  } catch (error) {
    console.error('Ошибка при генерации КТП:', error)
    throw error
  }
}
