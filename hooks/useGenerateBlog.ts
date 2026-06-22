// hooks/useGenerateBlog.ts
import { useState, useCallback, useRef, useEffect } from 'react';

// Types
export type GenerationType = 'post' | 'outline' | 'seo' | 'improve' | 'variations' | 'faq' | 'quality';
export type GenerationStatus = 'idle' | 'generating' | 'complete' | 'error' | 'cancelled';

export interface GenerateState {
  status: GenerationStatus;
  progress: number;
  message: string;
  data: any | null;
  error: string | null;
  startTime?: Date;
  endTime?: Date;
}

export interface GenerateOptions {
  prompt: string;
  includeImage?: boolean;
  temperature?: number;
  maxTokens?: number;
  model?: string;
  onProgress?: (progress: number, message: string) => void;
  onComplete?: (data: any) => void;
  onError?: (error: string) => void;
}

// Custom hook for blog generation
export function useGenerateBlog() {
  const [state, setState] = useState<GenerateState>({
    status: 'idle',
    progress: 0,
    message: '',
    data: null,
    error: null,
  });

  const [history, setHistory] = useState<any[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const startTimeRef = useRef<Date | null>(null);

  // Load history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('blog_generation_history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save history to localStorage
  const saveToHistory = useCallback((item: any) => {
    setHistory(prev => {
      const newHistory = [item, ...prev].slice(0, 50);
      localStorage.setItem('blog_generation_history', JSON.stringify(newHistory));
      return newHistory;
    });
  }, []);

  // Update generation progress
  const updateProgress = useCallback((progress: number, message: string) => {
    setState(prev => ({
      ...prev,
      progress,
      message,
    }));
  }, []);

  // Generate blog post with streaming progress
  const generatePost = useCallback(async (options: GenerateOptions) => {
    // Cancel any ongoing generation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    const currentStartTime = new Date();
    startTimeRef.current = currentStartTime;

    setState({
      status: 'generating',
      progress: 0,
      message: 'Initializing AI Content Flow...',
      data: null,
      error: null,
      startTime: currentStartTime,
    });

    // Simulated pseudo-stream interval reference
    let progressInterval: NodeJS.Timeout | null = null;

    try {
      // Validate prompt
      if (!options.prompt || options.prompt.trim().length < 10) {
        throw new Error('Please provide a detailed prompt (minimum 10 characters)');
      }

      // Simulate progress updates smoothly using functional update pattern
      progressInterval = setInterval(() => {
        setState(prev => {
          if (prev.status !== 'generating') return prev;
          const newProgress = Math.min(prev.progress + 5, 90);
          let dynamicMsg = prev.message;
          if (newProgress > 30 && newProgress <= 60) dynamicMsg = "Analyzing structure & context elements...";
          if (newProgress > 60) dynamicMsg = "Polishing and mapping final JSON layout...";
          
          return {
            ...prev,
            progress: newProgress,
            message: dynamicMsg
          };
        });
      }, 1000);

      // Call generate API route
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_post',
          data: {
            prompt: options.prompt,
            includeImage: options.includeImage || false,
            temperature: options.temperature || 0.7,
            maxTokens: options.maxTokens || 4000,
            model: options.model,
          },
        }),
        signal: abortControllerRef.current?.signal,
      });

      if (progressInterval) clearInterval(progressInterval);

      const result = await response.json();
      console.log("📥 [Hook Backend Pipe] Extracted Payload Response:", result);

      if (abortControllerRef.current?.signal.aborted) {
        setState(prev => ({
          ...prev,
          status: 'cancelled',
          message: 'Generation cancelled',
        }));
        return null;
      }

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'AI generation pipeline sequence failed.');
      }

      // Deep layout checking matching core parameters
      const extractedCoreData = result.data || result;

      // Finalize Object Setup
      const finalData = {
        ...(typeof extractedCoreData === 'object' ? extractedCoreData : {}),
        generationId: `gen_${Date.now()}`,
        generatedAt: new Date().toISOString(),
        prompt: options.prompt,
      };

      const currentEndTime = new Date();

      setState(prev => ({
        ...prev,
        status: 'complete',
        progress: 100,
        message: 'Blog post generated successfully!',
        data: finalData,
        error: null,
        startTime: prev.startTime || currentStartTime,
        endTime: currentEndTime,
      }));

      // Save safely into local layout history array structure
      saveToHistory({
        id: finalData.generationId,
        title: finalData.title || options.prompt.substring(0, 30) + '...',
        prompt: options.prompt,
        timestamp: currentEndTime.toISOString(),
        type: 'post',
      });

      if (options.onComplete) {
        options.onComplete(finalData);
      }
      
      return finalData;

    } catch (error: any) {
      if (progressInterval) clearInterval(progressInterval);
      
      if (abortControllerRef.current?.signal.aborted) {
        return null;
      }

      console.error("🔥 [Hook Core Exception Handler]:", error);

      setState(prev => ({
        ...prev,
        status: 'error',
        message: 'Generation failed',
        error: error.message || 'An unexpected internal model crash occurred.',
        endTime: new Date(),
      }));

      if (options.onError) {
        options.onError(error.message);
      }
      return null;
    }
  }, [saveToHistory]);

  // Generate outline only
  const generateOutline = useCallback(async (topic: string) => {
    const currentStartTime = new Date();
    setState({
      status: 'generating',
      progress: 0,
      message: 'Generating outline...',
      data: null,
      error: null,
      startTime: currentStartTime,
    });

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_outline',
          data: { topic },
        }),
      });
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      const currentEndTime = new Date();

      setState(prev => ({
        ...prev,
        status: 'complete',
        progress: 100,
        message: 'Outline generated!',
        data: result.data,
        error: null,
        endTime: currentEndTime,
      }));

      saveToHistory({
        id: `outline_${Date.now()}`,
        title: result.data.title || 'Generated Outline',
        topic,
        timestamp: currentEndTime.toISOString(),
        type: 'outline',
      });

      return result.data;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: error.message,
      }));
      return null;
    }
  }, [saveToHistory]);

  // Generate SEO metadata
  const generateSEO = useCallback(async (content: string, title?: string) => {
    setState({
      status: 'generating',
      progress: 0,
      message: 'Analyzing for SEO...',
      data: null,
      error: null,
      startTime: new Date(),
    });

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_seo',
          data: { content, title },
        }),
      });
      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error);
      }

      setState(prev => ({
        ...prev,
        status: 'complete',
        progress: 100,
        message: 'SEO metadata ready!',
        data: result.data,
        error: null,
        endTime: new Date(),
      }));

      return result.data;
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        status: 'error',
        error: error.message,
      }));
      return null;
    }
  }, []);

  // Reset state
  const reset = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setState({
      status: 'idle',
      progress: 0,
      message: '',
      data: null,
      error: null,
    });
  }, []);

  // Clear history
  const clearHistory = useCallback(() => {
    setHistory([]);
    localStorage.removeItem('blog_generation_history');
  }, []);

  // Get generation time
  const getGenerationTime = useCallback(() => {
    if (state.startTime && state.endTime) {
      return (state.endTime.getTime() - state.startTime.getTime()) / 1000;
    }
    return null;
  }, [state.startTime, state.endTime]);

  return {
    state,
    history,
    isGenerating: state.status === 'generating',
    isComplete: state.status === 'complete',
    hasError: state.status === 'error',
    generationTime: getGenerationTime(),
    generatePost,
    generateOutline,
    generateSEO,
    reset,
    clearHistory,
    updateProgress,
  };
}