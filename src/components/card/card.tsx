interface CardProps {
    title: string;
    description: string;
    image: string;
    price: number;
}

function Card({ title, description, image, price }: CardProps) {
    return (
        <div className="card">
            <h2>{title}</h2>
            <p>{description}</p>
            <img src={image} alt={title} />
            <p>{price}</p>
        </div>
            )
}

export default Card;