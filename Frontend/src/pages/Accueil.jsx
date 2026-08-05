import { useEffect, useState } from 'react'; 
import { api } from '../api/axios'; 
import CardProduit from '../components/CardProduit'; 
 
export default function Accueil() { 
  const [produits, setProduits] = useState([]); 
  const [loading, setLoading] = useState(true); 
 
  useEffect(() => { 
    api.get('/produits') 
      .then(res => { 
        setProduits(res.data); 
        setLoading(false); 
      }) 
      .catch(() => setLoading(false)); 
  }, []); 
 
  if (loading) return <p className="text-center mt-10">Chargement...</p>; 
 
  return ( 
    <div className="max-w-6xl mx-auto mt-10 px-4 grid grid-cols-1 
sm:grid-cols-2 md:grid-cols-3 gap-6"> 
      {produits.map(p => ( 
        <CardProduit key={p.id} produit={p} /> 
      ))} 
    </div> 
  ); 
} 