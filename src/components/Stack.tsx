import { motion, useMotionValue, useTransform } from "motion/react";
import React, { useState } from "react";

interface CardRotateProps {
  children: React.ReactNode;
  onSendToBack: () => void;
  sensitivity: number;
}

function CardRotate({ children, onSendToBack, sensitivity }: CardRotateProps) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [60, -60]);
  const rotateY = useTransform(x, [-100, 100], [-60, 60]);

  function handleDragEnd(
    _: unknown,
    info: { offset: { x: number; y: number } }
  ) {
    if (
      Math.abs(info.offset.x) > sensitivity ||
      Math.abs(info.offset.y) > sensitivity
    ) {
      onSendToBack();
    } else {
      x.set(0);
      y.set(0);
    }
  }

  return (
    <motion.div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 cursor-grab"
      style={{ x, y, rotateX, rotateY }}
      drag
      dragConstraints={{ top: 0, right: 0, bottom: 0, left: 0 }}
      dragElastic={0.6}
      whileTap={{ cursor: "grabbing" }}
      onDragEnd={handleDragEnd}
    >
      {children}
    </motion.div>
  );
}

type StackCard = {
  id: number;
  img: string;
  name?: string;
  age?: number;
  bio?: string;
  interests?: string[];
};

interface StackProps {
  randomRotation?: boolean;
  sensitivity?: number;
  cardDimensions?: { width: number; height: number };
  sendToBackOnClick?: boolean;
  cardsData?: StackCard[];
  animationConfig?: { stiffness: number; damping: number };
  onReady?: (api: {
    sendTopToBack: (action?: "like" | "pass" | "superlike") => void;
  }) => void;
}

export default function Stack({
  randomRotation = false,
  sensitivity = 200,
  cardDimensions = { width: 300, height: 400 },
  cardsData = [],
  animationConfig = { stiffness: 260, damping: 20 },
  sendToBackOnClick = false,
  onReady,
}: StackProps) {
  const [cards, setCards] = useState<StackCard[]>(
    cardsData.length
      ? cardsData
      : [
          {
            id: 1,
            img: "https://images.unsplash.com/photo-1480074568708-e7b720bb3f09?q=80&w=500&auto=format",
            name: "Anna",
            age: 25,
            bio: "Love traveling and photography",
          },
          {
            id: 2,
            img: "https://images.unsplash.com/photo-1449844908441-8829872d2607?q=80&w=500&auto=format",
            name: "Maria",
            age: 28,
            bio: "Nature lover and yoga instructor",
          },
          {
            id: 3,
            img: "https://images.unsplash.com/photo-1452626212852-811d58933cae?q=80&w=500&auto=format",
            name: "Sofia",
            age: 24,
            bio: "Artist and coffee enthusiast",
          },
          {
            id: 4,
            img: "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?q=80&w=500&auto=format",
            name: "Elena",
            age: 26,
            bio: "Reader and cyclist",
          },
        ]
  );

  const sendToBack = (id: number) => {
    setCards((prev) => {
      const newCards = [...prev];
      const index = newCards.findIndex((card) => card.id === id);
      const [card] = newCards.splice(index, 1);
      newCards.unshift(card);
      return newCards;
    });
  };

  // expose simple API
  React.useEffect(() => {
    if (!onReady) return;
    const api = {
      sendTopToBack: (_action?: "like" | "pass" | "superlike") => {
        if (cards.length === 0) return;
        const top = cards[cards.length - 1];
        sendToBack(top.id);
      },
    };
    onReady(api);
    // re-create only when cards length changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cards.length, onReady]);

  return (
    <div
      className="relative"
      style={{
        width: cardDimensions.width,
        height: cardDimensions.height,
        perspective: 600,
      }}
    >
      {cards.map((card, index) => {
        const randomRotate = randomRotation ? Math.random() * 10 - 5 : 0;

        return (
          <CardRotate
            key={card.id}
            onSendToBack={() => sendToBack(card.id)}
            sensitivity={sensitivity}
          >
            <motion.div
              className="rounded-2xl overflow-hidden border border-border component-bg shadow-md"
              onClick={() => sendToBackOnClick && sendToBack(card.id)}
              animate={{
                rotateZ: (cards.length - index - 1) * 4 + randomRotate,
                scale: 1 + index * 0.06 - cards.length * 0.06,
                transformOrigin: "50% 60%",
              }}
              initial={false}
              transition={{
                type: "spring",
                stiffness: animationConfig.stiffness,
                damping: animationConfig.damping,
              }}
              style={{
                width: cardDimensions.width,
                height: cardDimensions.height,
              }}
            >
              <img
                src={card.img}
                alt={`card-${card.id}`}
                className="w-full h-full object-cover pointer-events-none"
              />
              {(card.name || card.age || card.bio) && (
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <div className="component-bg border border-border rounded-xl p-2">
                    <div className="text-sm font-semibold text-foreground">
                      {card.name}
                      {card.age ? ` • ${card.age}` : ""}
                    </div>
                    {card.bio && (
                      <div className="text-[11px] text-foreground/70 line-clamp-1">
                        {card.bio}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          </CardRotate>
        );
      })}
    </div>
  );
}
