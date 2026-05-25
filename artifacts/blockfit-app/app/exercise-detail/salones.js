const API_URL = 'https://apipruebas.paseolagaleriacentrodeeventos.com.py/api'

const TOKEN = '20006|q4iJ8wfbx35aZIjxAzKui7ybOsN30t447CRUdyAz2008107d'

export async function obtenerSalones() {

  const response = await fetch(

    `${API_URL}/salones`,

    {
      method: 'GET',

      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    }

  )

  const data = await response.json()

  console.log(data)

  return data
}