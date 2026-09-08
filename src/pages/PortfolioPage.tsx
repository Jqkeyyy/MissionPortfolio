import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { QuickPortfolio } from '@/components/quick-portfolio';
import { useDocumentMetadata } from '@/hooks/useDocumentMetadata';
import { SITE_URL } from '@/config/site';

const PortfolioPage = () => {
  const navigate = useNavigate();
  const structuredData = useMemo(() => ({
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    name: 'Jake Sass — Software Developer Portfolio',
    url: `${SITE_URL}/portfolio`,
    mainEntity: {
      '@type': 'Person',
      name: 'Jacob Sass',
      alternateName: 'Jake Sass',
      jobTitle: 'Software Developer',
    },
  }), []);

  useDocumentMetadata({
    title: 'Software Developer Portfolio — Jake Sass',
    description: 'Projects, engineering case studies, experience, technical skills, résumé, and contact details for software developer Jake Sass.',
    path: '/portfolio',
    structuredData,
  });

  return <QuickPortfolio standalone onClose={() => navigate('/')} />;
};

export default PortfolioPage;
