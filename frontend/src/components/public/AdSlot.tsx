type AdSlotProps = {
  variant?: 'banner' | 'in-article' | 'sidebar' | 'between-posts';
  className?: string;
};

export default function AdSlot({ variant = 'in-article', className = '' }: AdSlotProps) {
  // HIDDEN FOR NOW: The website is maturing. 
  // In 30 days, when you get AdSense approved, 
  // delete the `return null;` line below to show the ads again.
  return null;

  const heightMap: Record<string, string> = {
    banner: 'min-h-[90px]',
    'in-article': 'min-h-[250px]',
    sidebar: 'min-h-[300px]',
    'between-posts': 'min-h-[120px]',
  };

  return (
    <div
      className={`ad-slot relative flex items-center justify-center overflow-hidden rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 ${heightMap[variant]} ${className}`}
      data-ad-slot={variant}
    >
      {/* Google AdSense will auto-fill this container.
          Replace with actual ad unit after AdSense approval:
          <ins className="adsbygoogle"
               style={{ display: 'block' }}
               data-ad-client="ca-pub-XXXXX"
               data-ad-slot="XXXXXXX"
               data-ad-format="auto"
               data-full-width-responsive="true" />
      */}
      <p className="text-xs text-slate-300">Ad Space</p>
    </div>
  );
}
