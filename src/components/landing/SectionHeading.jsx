import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

function SectionHeading({ badge, title, description, align = 'center' }) {
    const alignment = align === 'left' ? 'text-left' : 'text-center';
    const width = align === 'left' ? 'max-w-2xl' : 'mx-auto max-w-3xl';

    return (
        <div className={`${alignment} ${width}`}>
            {badge ? (
                <Badge className="mb-4 border-primary/20 bg-primary/10 px-4 py-2 text-sm text-primary sm:px-4 sm:py-1.5 sm:text-xs">
                    <Sparkles className="mr-1.5 h-3.5 w-3.5 sm:mr-1 sm:h-3 sm:w-3" />
                    {badge}
                </Badge>
            ) : null}
            <h2 className="text-[2.35rem] font-bold leading-[1.05] tracking-tight text-foreground sm:text-4xl">{title}</h2>
            <p className="mt-4 text-[1.02rem] leading-8 text-muted-foreground sm:text-lg sm:leading-8">{description}</p>
        </div>
    );
}

export default SectionHeading;
