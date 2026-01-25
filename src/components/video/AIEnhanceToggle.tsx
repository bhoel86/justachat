import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface AIEnhanceToggleProps {
  isEnabled: boolean;
  isLoading?: boolean;
  onToggle: () => void;
}

const AIEnhanceToggle = ({ isEnabled, isLoading = false, onToggle }: AIEnhanceToggleProps) => {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={isEnabled ? "default" : "outline"}
          size="sm"
          onClick={onToggle}
          disabled={isLoading}
          className={`h-7 text-xs ${isEnabled ? 'bg-purple-500 hover:bg-purple-600' : ''}`}
        >
          {isLoading ? (
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
          ) : (
            <Sparkles className="w-3 h-3 mr-1" />
          )}
          AI Enhance
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{isEnabled ? 'Disable' : 'Enable'} AI video enhancement (sharpening)</p>
      </TooltipContent>
    </Tooltip>
  );
};

export default AIEnhanceToggle;
