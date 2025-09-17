import { Link } from 'react-router-dom'

const Login = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-4">Login</h1>
        <p className="text-gray-600 mb-4">Authentication not required for demo</p>
        <Link 
          to="/dashboard"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  )
}

export default Login