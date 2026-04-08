export default function Spinner({ size = 22, className = '' }) {
  return (
    <img
      src="/spinner.gif"
      alt="Loading..."
      width={size}
      height={size}
      className={className}
    />
  )
}
