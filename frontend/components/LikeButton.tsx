import React, { useState } from 'react';
import { Heart } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toggleProjectLike } from '../services/like.service';
import toast from 'react-hot-toast';

interface LikeButtonProps {
  projectId: string;
  initialLiked: boolean;
  initialCount: number;
  visibility?: 'PRIVATE' | 'PUBLIC_VIEW' | 'PUBLIC_LIKE' | null;
  size?: 'sm' | 'md';
  variant?: 'overlay' | 'inline';
  onChange?: (liked: boolean, count: number) => void;
}

export const LikeButton: React.FC<LikeButtonProps> = ({
  projectId,
  initialLiked,
  initialCount,
  visibility,
  size = 'md',
  variant = 'inline',
  onChange,
}) => {
  const queryClient = useQueryClient();
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);

  const disabled = visibility === 'PUBLIC_VIEW' || visibility === 'PRIVATE';

  const mutation = useMutation({
    mutationFn: () => toggleProjectLike(projectId),
    onMutate: () => {
      const nextLiked = !liked;
      const nextCount = liked ? Math.max(0, count - 1) : count + 1;
      setLiked(nextLiked);
      setCount(nextCount);
      onChange?.(nextLiked, nextCount);
      return { prevLiked: liked, prevCount: count };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx) {
        setLiked(ctx.prevLiked);
        setCount(ctx.prevCount);
        onChange?.(ctx.prevLiked, ctx.prevCount);
      }
      toast.error('Não foi possível registrar sua curtida.');
    },
    onSuccess: (data) => {
      setLiked(data.liked);
      setCount(data.likeCount);
      onChange?.(data.liked, data.likeCount);
      queryClient.invalidateQueries({ queryKey: ['catalog'] });
    },
  });

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (disabled) {
      toast('Este projeto não aceita Likes no momento.', { icon: 'ℹ️' });
      return;
    }
    if (mutation.isPending) return;
    mutation.mutate();
  };

  const iconSize = size === 'sm' ? 14 : 18;
  const padding = size === 'sm' ? 'px-2 py-1' : 'px-3 py-1.5';
  const fontSize = size === 'sm' ? 'text-[11px]' : 'text-xs';

  if (variant === 'overlay') {
    return (
      <button
        onClick={handleClick}
        disabled={disabled || mutation.isPending}
        className={`flex items-center gap-1.5 rounded-full bg-black/40 backdrop-blur-md ${padding} ${fontSize} font-bold text-white transition-all hover:bg-black/60 disabled:cursor-not-allowed disabled:opacity-60`}
        aria-label={liked ? 'Descurtir' : 'Curtir'}
      >
        <Heart
          size={iconSize}
          className={liked ? 'fill-rose-500 stroke-rose-500' : 'stroke-white'}
        />
        <span>{count}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled || mutation.isPending}
      className={`flex items-center gap-1.5 rounded-lg border ${padding} ${fontSize} font-bold transition-all disabled:cursor-not-allowed disabled:opacity-60 ${
        liked
          ? 'border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900/40 dark:bg-rose-500/10 dark:text-rose-400'
          : 'border-gray-200 bg-white text-gray-700 hover:border-rose-300 hover:text-rose-600 dark:border-gray-700 dark:bg-white/5 dark:text-gray-300 dark:hover:border-rose-500/50 dark:hover:text-rose-400'
      }`}
      aria-label={liked ? 'Descurtir' : 'Curtir'}
    >
      <Heart size={iconSize} className={liked ? 'fill-rose-500 stroke-rose-500' : ''} />
      <span>{count}</span>
    </button>
  );
};

export default LikeButton;
