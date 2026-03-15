import React from 'react';


interface NewsItem {
  title: string;
  date: string;
  author: string;
  content: string;
}

interface ComponentNewsProps {
  news: NewsItem[];
}

const NewsComponent: React.FC<ComponentNewsProps> = ({ news }) => (
  <>
    <div className='titleDiv_News'>
      <h1>HSS Noticias</h1>
    </div>

    <section className='sectionDiv_News'>
      <div className='listNewsDiv_News'>
        {news.map((item, index) => (
          <li key={index}>
            <div className='NewsData'>
              <div className='titleAutor'>
                <h2>{item.title}</h2>
                <small>{item.author} - {item.date}</small>
              </div>

            </div>

            <div className='NewsContent'>
              <p>{item.content}</p>

            </div>
          
          </li>
        ))}
      </div>
    </section>
  </>
  
);

export default NewsComponent;
