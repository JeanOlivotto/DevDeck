import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: process.env.EMAIL_SECURE === 'true',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

export async function sendEmail(
  to: string,
  subject: string,
  html: string
): Promise<void> {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    })
  } catch (error) {
    console.error('Error sending email:', error)
    throw error
  }
}

export async function sendDailySummary(
  email: string,
  userName: string,
  boards: any[]
): Promise<void> {
  const html = `
    <h1>Olá, ${userName}!</h1>
    <p>Aqui está seu resumo diário do DevDeck:</p>
    ${boards
      .map(
        (board) => `
      <h2>${board.name}</h2>
      <ul>
        <li>TODO: ${board.tasks.filter((t: any) => t.status === 'TODO').length}</li>
        <li>DOING: ${board.tasks.filter((t: any) => t.status === 'DOING').length}</li>
        <li>DONE: ${board.tasks.filter((t: any) => t.status === 'DONE').length}</li>
      </ul>
    `
      )
      .join('')}
    <p>Tenha um ótimo dia!</p>
  `

  await sendEmail(email, 'Resumo Diário - DevDeck', html)
}

export async function sendStaleTasksNotification(
  email: string,
  userName: string,
  staleTasks: any[]
): Promise<void> {
  const html = `
    <h1>Olá, ${userName}!</h1>
    <p>Você tem tarefas que estão paradas há mais de 3 dias:</p>
    <ul>
      ${staleTasks.map((task) => `<li>${task.title} (${task.board.name})</li>`).join('')}
    </ul>
    <p>Que tal dar uma atenção a elas?</p>
  `

  await sendEmail(email, 'Tarefas Paradas - DevDeck', html)
}
