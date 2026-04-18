export default function AuthLayout({ children }: any) {
  return (
    <div className="relative flex items-center justify-center min-h-screen overflow-hidden text-white bg-cosmic">
      <div className="absolute w-[600px] h-[600px] bg-neonPurple/30 blur-3xl rounded-full top-10 left-10"></div>
      <div className="absolute w-[600px] h-[600px] bg-neonBlue/30 blur-3xl rounded-full bottom-20 right-20"></div>
      <div className="absolute w-[500px] h-[500px] bg-neonPink/30 blur-3xl rounded-full top-1/2 left-1/2"></div>

      <div className="relative w-full max-w-md p-10 border shadow-[0_20px_80px_rgba(0,0,0,0.25)] backdrop-blur-2xl rounded-3xl bg-white/5 border-white/10">
        <h1 className="mb-6 text-3xl font-bold text-center">
          <span className="text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text">
            CMO.AI
          </span>
        </h1>
        {children}
      </div>
    </div>
  );
}
