export default function Loader({ fullScreen = false }) {
  return (
    <div className={`grid place-items-center ${fullScreen ? 'min-h-screen' : 'py-12'}`}>
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-brand" />
    </div>
  );
}
