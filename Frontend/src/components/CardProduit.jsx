export default function CardProduit({ produit }) { 
  return ( 
    <div className="border rounded shadow p-4 bg-white"> 
      <img 
        src={produit.image} 
        alt={produit.nom} 
        className="w-full h-40 object-cover mb-2 rounded" 
      /> 
      <h3 className="font-bold text-lg">{produit.nom}</h3> 
      <p className="text-gray-600">{produit.description}</p> 
      <p className="text-green-600 font-bold mt-2">{produit.prix} €</p> 
    </div> 
  ); 
} 