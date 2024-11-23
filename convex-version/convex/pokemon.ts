import { Randomize } from "@convex-dev/aggregate";
import { components, internal } from "./_generated/api";
import type { DataModel, Doc, Id } from "./_generated/dataModel";
import {
  internalAction,
  internalMutation,
  mutation,
  MutationCtx,
  query,
} from "./_generated/server";
import { v } from "convex/values";

export const getPair = query({
  args: { randomSeed: v.number() },
  handler: async (ctx,args): Promise<[Doc<"pokemon">, Doc<"pokemon">]> => {
    const pokemon = await ctx.db.query("pokemon").collect();
    
    if (pokemon.length < 2) {
      throw new Error("Not enough pokemon in database");
    }

    for (let i = pokemon.length - 1; i > 0; i--) {
      const j = Math.floor((args.randomSeed * (i + 1))) % (i + 1);
      [pokemon[i], pokemon[j]] = [pokemon[j], pokemon[i]];
    }

    return [pokemon[0], pokemon[1]];
  },
});

export const vote = mutation({
  args: { voteFor: v.id("pokemon"), voteAgainst: v.id("pokemon") },
  handler: async (ctx, { voteFor, voteAgainst }) => {
    const id = await ctx.db.insert("votes", {
      votedForId: voteFor,
      votedAgainstId: voteAgainst,
    });
    await updateElo(ctx, voteFor, voteAgainst);
  },
});


function calculateEloChange(winnerElo: number, loserElo: number, k = 32) {
  const expectedScore = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
  const winnerDelta = k * (1 - expectedScore);
  const loserDelta = k * (0 - (1 - expectedScore));
  return [winnerDelta, loserDelta];
}

async function updateElo(ctx: MutationCtx, winnerId: Id<"pokemon">, loserId: Id<"pokemon">) {
  const winner = await ctx.db.get(winnerId);
  const loser = await ctx.db.get(loserId);

  const [winnerEloChange, loserEloChange] = calculateEloChange(
    winner!.eloRating,
    loser!.eloRating
  );

  await ctx.db.patch(winnerId, {
    eloRating: winner!.eloRating + winnerEloChange,
  });

  await ctx.db.patch(loserId, {
    eloRating: loser!.eloRating + loserEloChange,
  });
}

export const results = query({
  handler: async (ctx) => {
    return ctx.db
      .query("pokemon")
      .withIndex("by_elo")
      .order("desc")
      .collect();
  },
});

const randomPokemonAggregate = new Randomize<DataModel, "pokemon">(
  components.randomPokemonAggregate,
);

//////  INIT STUFF BELOW
export const addPokemon = internalMutation({
  args: { pokemon: v.array(v.object({ name: v.string(), dexId: v.number() })) },
  handler: async (ctx, args) => {
    for (const p of args.pokemon) {
      const id = await ctx.db.insert("pokemon", {
        name: p.name,
        dexId: p.dexId,
        eloRating: 1200,
      });
      await randomPokemonAggregate.insert(ctx, id);
    }
  },
});

// Just run this in the Convex dashboard.
export const initDatabase = internalAction({
  args: {},
  handler: async (ctx) => {
    const allPokemon = await getAllPokemon();

    const formattedPokemon = allPokemon.map((p) => ({
      dexId: p.dexNumber,
      name: p.name,
    }));

    for (let i = 0; i < formattedPokemon.length; i += 100) {
      const batch = formattedPokemon.slice(i, i + 100);
      await ctx.runMutation(internal.pokemon.addPokemon, {
        pokemon: batch,
      });
    }
  },
});

/**
 * Fetches all Pokemon from Gen 1-9 (up to #1025) from the PokeAPI GraphQL endpoint.
 * Each Pokemon includes their name, Pokedex number, and sprite URL.
 * Results are cached indefinitely using Next.js cache.
 */
async function getAllPokemon() {
  // Use the graphql endpoint because the normal one won't let you get names
  // in a single query
  const query = `
    query GetAllPokemon {
      pokemon_v2_pokemon(where: {id: {_lte: 1025}}) {
        id
        pokemon_v2_pokemonspecy {
          name
        }
      }
    }
  `;

  const response = await fetch("https://beta.pokeapi.co/graphql/v1beta", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });

  const data = (await response.json()).data as {
    pokemon_v2_pokemon: {
      id: number;
      pokemon_v2_pokemonspecy: {
        name: string;
      };
    }[];
  };

  return data.pokemon_v2_pokemon.map((pokemon) => ({
    name: pokemon.pokemon_v2_pokemonspecy.name,
    dexNumber: pokemon.id,
  }));
}

const doBackfill = async () => {};
