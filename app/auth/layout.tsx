

const AuthLayout = ({children}: {children:React.ReactNode}) => {
  return (
    <div className="h-full flex mt-[-10%] items-center justify-center bg-gradient-to-r from-blue-800 via-sky-400 to-blue-800">
      {children}
    </div>
  )
}

export default AuthLayout
