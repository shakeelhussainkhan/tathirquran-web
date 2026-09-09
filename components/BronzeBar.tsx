export default function BronzeBar({ className = "" }: { className?: string }) {
  return (
    <div
      className={className}
      style={{
        width: "3px",
        flexShrink: 0,
        background: "linear-gradient(180deg, #e8c96a, #c9a227, #8b6520)",
        alignSelf: "stretch",
        minHeight: "100%",
      }}
      aria-hidden="true"
    />
  );
}
