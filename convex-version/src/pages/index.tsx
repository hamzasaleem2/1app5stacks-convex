import { api } from "convex/_generated/api";
import { Id } from "convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import Head from "next/head";
import { useState } from "react";
import getLayout from "~/utils/layout";

import { PokemonSprite } from "~/utils/sprite";

function VotePageContents() {
  const [seed, setSeed] = useState(Math.random());
  const data = useQuery(api.pokemon.getPair, { randomSeed: seed });
  const voteMutation = useMutation(api.pokemon.vote);

  if (!data) return <VoteFallback />;

  const [pokemonOne, pokemonTwo] = data;

  function handleVote(winnerId: Id<"pokemon">, loserId: Id<"pokemon">) {
    void voteMutation({ voteAgainst: loserId, voteFor: winnerId });
    setSeed(Math.random());
  }

  return (
    <>
      {/* Pokemon One */}
      <div key={pokemonOne._id} className="flex flex-col items-center gap-4">
        <PokemonSprite dexId={pokemonOne.dexId} className="h-64 w-64" />
        <div className="text-center">
          <span className="text-lg text-gray-500">#{pokemonOne.dexId}</span>
          <h2 className="text-2xl font-bold capitalize">{pokemonOne.name}</h2>
          <button
            onClick={() => handleVote(pokemonOne._id, pokemonTwo._id)}
            className="rounded-lg bg-blue-500 px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-blue-600"
          >
            Vote
          </button>
        </div>
      </div>

      {/* Pokemon Two */}
      <div key={pokemonTwo._id} className="flex flex-col items-center gap-4">
        <PokemonSprite dexId={pokemonTwo.dexId} className="h-64 w-64" />
        <div className="text-center">
          <span className="text-lg text-gray-500">#{pokemonTwo.dexId}</span>
          <h2 className="text-2xl font-bold capitalize">{pokemonTwo.name}</h2>
          <button
            onClick={() => handleVote(pokemonTwo._id, pokemonOne._id)}
            className="rounded-lg bg-blue-500 px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-blue-600"
          >
            Vote
          </button>
        </div>
      </div>
    </>
  );
}

function VoteFallback() {
  return (
    <>
      {[1, 2].map((i) => (
        <div key={i} className="flex flex-col items-center gap-4">
          <div className="h-64 w-64 animate-pulse rounded-lg bg-gray-800/10" />
          <div className="flex flex-col items-center justify-center space-y-2 text-center">
            <div className="h-6 w-16 animate-pulse rounded bg-gray-800/10" />
            <div className="h-8 w-32 animate-pulse rounded bg-gray-800/10" />
            <div className="h-12 w-24 animate-pulse rounded bg-gray-800/10" />
          </div>
        </div>
      ))}
    </>
  );
}

function VotePage() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center gap-16">
      <Head>
        <title>Roundest (T3 Stack Version)</title>
      </Head>
      <VotePageContents />
    </div>
  );
}

VotePage.getLayout = getLayout;

export default VotePage;
