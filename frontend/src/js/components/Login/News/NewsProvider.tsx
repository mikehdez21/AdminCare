import React, { useState } from 'react';
import ComponentNews from './NewsComponent';

interface NewsItem {
  title: string;
  date: string;
  author: string;
  content: string;
}

const NewsProvider: React.FC = () => {
  const [news] = useState<NewsItem[]>([
    {
      title: 'Cumpleaños Mes Agosto',
      date: '2024-05-01 10:00',
      author: 'Jefatura de Recursos Humanos',
      content: 'Contenido de la noticia 1'
    },
    {
      title: 'Noticia 2',
      date: '2024-05-02 12:00',
      author: 'Direccion Medica',
      content: 'Contenido de la noticia 2'
    },
    {
      title: 'Noticia 3',
      date: '2024-05-03 14:00',
      author: 'Direccion Operativa',
      content: 'Contenido de la noticia 3'
    },
    {
      title: 'Noticia 4',
      date: '2024-05-03 14:00',
      author: 'Jefatura de Sistemas',
      content: 'Contenido de la noticia 4'
    },
    {
      title: 'Noticia 5',
      date: '2024-05-03 14:00',
      author: 'Jefatura de Urgencias',
      content: 'Contenido de la noticia 5'
    },
    {
      title: 'Noticia 6',
      date: '2024-05-03 14:00',
      author: 'Autor 6',
      content: 'Contenido de la noticia 6'
    },
    {
      title: 'Noticia 7',
      date: '2024-05-03 14:00',
      author: 'Autor 7',
      content: 'Contenido de la noticia 7'
    },
    {
      title: 'Noticia 8',
      date: '2024-05-03 14:00',
      author: 'Autor 8',
      content: 'Contenido de la noticia 8'
    }
  ]);

  return (
    <ComponentNews news={news} />
  );
};

export default NewsProvider;
