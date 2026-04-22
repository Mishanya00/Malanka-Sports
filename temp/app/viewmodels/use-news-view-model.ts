import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Network from 'expo-network';
import { useCallback, useState } from 'react';

export type Article = {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
};

const CACHE_KEY = '@news_cache';
const API_URL = 'https://saurav.tech/NewsAPI/top-headlines/category/sports/us.json';

export const useNewsViewModel = () => {
  const[news, setNews] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOffline, setIsOffline] = useState(false);

  const fetchNews = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const networkState = await Network.getNetworkStateAsync();
      
      if (!networkState.isConnected) {
        throw new Error('No internet connection');
      }

      setIsOffline(false);
      const response = await fetch(API_URL);
      const data = await response.json();
      
      const articles = data.articles ||[];
      setNews(articles);

      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(articles));

    } catch (error) {
      console.log('Fetching news failed, loading from cache...', error);
      setIsOffline(true);
      
      const cachedData = await AsyncStorage.getItem(CACHE_KEY);
      if (cachedData) {
        setNews(JSON.parse(cachedData));
      }
    } finally {
      setIsLoading(false);
    }
  },[]);

  return {
    news,
    isLoading,
    isOffline,
    fetchNews
  };
};