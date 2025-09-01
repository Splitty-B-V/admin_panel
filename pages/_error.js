import { useEffect } from 'react'
import { useRouter } from 'next/router'

function Error({ statusCode }) {
  const router = useRouter()

  useEffect(() => {
    // Redirect to dashboard after a moment
    const timer = setTimeout(() => {
      router.push('/dashboard')
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-gray-900 mb-4">
              {statusCode || '404'}
            </h1>
            <p className="text-xl text-gray-600 mb-4">
              {statusCode === 404
                ? 'Pagina niet gevonden'
                : statusCode === 500
                ? 'Server fout'
                : 'Er is een fout opgetreden'}
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Je wordt doorgestuurd naar het dashboard...
            </p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

Error.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404
  return { statusCode }
}

export default Error