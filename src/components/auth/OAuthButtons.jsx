export default function OAuthButtons({ onGoogle, onMicrosoft }) {
  return (
    <div className="flex flex-col gap-3 w-full">
      {/* Divider */}
      <div className="flex items-center gap-3 my-1">
        <hr className="flex-1 border-gray-200" />
        <span className="text-xs text-gray-400 whitespace-nowrap">Or continue with</span>
        <hr className="flex-1 border-gray-200" />
      </div>

      {/* Google */}
      <button
        id="btn-google-oauth"
        type="button"
        onClick={onGoogle}
        className="flex items-center justify-center gap-3 w-full rounded-lg border border-gray-200
                   py-3 text-[0.9rem] font-medium text-gray-700
                   transition-colors hover:border-gray-300 hover:bg-gray-50 cursor-pointer"
      >
        <img src="/google.svg" alt="Google" width="20" height="20" />
        Sign in with Google
      </button>

      {/* Microsoft */}
      <button
        id="btn-microsoft-oauth"
        type="button"
        onClick={onMicrosoft}
        className="flex items-center justify-center gap-3 w-full rounded-lg border border-gray-200
                   py-3 text-[0.9rem] font-medium text-gray-700
                   transition-colors hover:border-gray-300 hover:bg-gray-50 cursor-pointer"
      >
        <img src="/microsoft.svg" alt="Microsoft" width="20" height="20" />
        Sign in with Microsoft
      </button>
    </div>
  )
}
