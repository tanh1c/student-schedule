import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

function PreviewCard(props) {
    const { icon, title, subtitle, accent, children, className = '' } = props;
    const Icon = icon;

    return (
        <Card className={`overflow-hidden border-white/60 bg-white/80 shadow-xl shadow-slate-200/50 backdrop-blur dark:border-white/10 dark:bg-slate-950/70 dark:shadow-black/30 ${className}`}>
            <CardContent className="p-4 sm:p-5">
                <div className="mb-4 flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-white shadow-lg`}>
                        <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">{title}</p>
                        <p className="text-xs text-muted-foreground">{subtitle}</p>
                    </div>
                </div>
                {children}
            </CardContent>
        </Card>
    );
}

export default PreviewCard;
