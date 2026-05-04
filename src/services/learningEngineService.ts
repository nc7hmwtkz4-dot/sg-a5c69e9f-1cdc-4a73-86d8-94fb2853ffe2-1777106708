import { supabase } from "@/integrations/supabase/client";

interface ObservationData {
  id: number;
  car_id: number;
  type_id: number;
  base_price_min: number;
  base_price_x2: number;
  price_min_total: number;
  price_x2_total: number;
  rep_total: number;
  base_reputation: number;
  parts: Record<string, number>;
}

interface DeducedValue {
  priceMin: number;
  priceX2: number;
  rep: number;
  count: number;
}

const RARITY_NORMALIZATION: Record<string, string> = {
  "Singulière": "Singuliere",
  "Épique": "Epique",
  "Légendaire": "Legendaire",
  "Secrète": "Secrete",
};

function normalizeRarityLabel(rarity: string | null): string | null {
  if (!rarity) return null;
  return RARITY_NORMALIZATION[rarity] || rarity;
}

/**
 * 🚗 ALGORITHME D'APPRENTISSAGE PAR TYPE DE VOITURE
 * 
 * Un algorithme indépendant pour chaque type (Singulière, Rare, Épique, Légendaire, Secrète)
 * Calcule les bonus de Prix Min ET Prix x2 pour chaque rareté de pièce
 */
function runAlgorithmForCarType(typeId: number, typeName: string, observations: ObservationData[]) {
  console.log(`\n=== 🚗 ALGORITHME ${typeId} : TYPE ${typeName.toUpperCase()} ===`);
  console.log(`Analyse de ${observations.length} observations spécifiques...`);

  const learnedValues: Record<string, DeducedValue[]> = {
    Gris: [], Singuliere: [], Rare: [], Epique: [], Legendaire: [], Secrete: []
  };

  const mixedObs: ObservationData[] = [];

  // PHASE 1 : Observations PURES (1 seule rareté)
  for (const obs of observations) {
    const rarities = Object.keys(obs.parts);
    if (rarities.length === 0) continue; // Stock
    
    if (rarities.length === 1) {
      const rarity = rarities[0];
      const count = obs.parts[rarity];
      const bonusPriceMin = obs.price_min_total - obs.base_price_min;
      const bonusPriceX2 = obs.price_x2_total - obs.base_price_x2;
      const bonusRep = obs.rep_total - obs.base_reputation;
      
      if (!learnedValues[rarity]) {
        learnedValues[rarity] = [];
      }

      learnedValues[rarity].push({
        priceMin: bonusPriceMin / count,
        priceX2: bonusPriceX2 / count,
        rep: bonusRep / count,
        count: 1
      });
      console.log(`[Pure] ${count}x ${rarity} -> 1 ${rarity} = ${Math.round(bonusPriceMin / count)}€ (Min) | ${Math.round(bonusPriceX2 / count)}€ (x2)`);
    } else {
      mixedObs.push(obs);
    }
  }

  // Fonction pour obtenir les moyennes actuelles
  const getKnownAverages = () => {
    const avgs: Record<string, { priceMin: number, priceX2: number, rep: number, count: number }> = {};
    for (const [rarity, values] of Object.entries(learnedValues)) {
      if (values.length > 0) {
        avgs[rarity] = {
          priceMin: values.reduce((a, b) => a + b.priceMin, 0) / values.length,
          priceX2: values.reduce((a, b) => a + b.priceX2, 0) / values.length,
          rep: values.reduce((a, b) => a + b.rep, 0) / values.length,
          count: values.length
        };
      }
    }
    return avgs;
  };

  // PHASE 2 : Déduction en cascade (observations mixtes)
  // 3 passages pour résoudre les dépendances en chaîne
  for (let iteration = 0; iteration < 3; iteration++) {
    const knowns = getKnownAverages();
    let deductionsMade = false;
    
    for (const obs of mixedObs) {
      const rarities = Object.keys(obs.parts);
      const unknowns = rarities.filter(r => knowns[r] === undefined);
      
      // Si on connaît TOUTES les pièces sauf UNE, on peut la déduire !
      if (unknowns.length === 1) {
        const unknownRarity = unknowns[0];
        const unknownCount = obs.parts[unknownRarity];
        
        let knownBonusPriceMin = 0;
        let knownBonusPriceX2 = 0;
        let knownBonusRep = 0;
        
        for (const r of rarities) {
          if (r !== unknownRarity) {
            knownBonusPriceMin += obs.parts[r] * knowns[r].priceMin;
            knownBonusPriceX2 += obs.parts[r] * knowns[r].priceX2;
            knownBonusRep += obs.parts[r] * knowns[r].rep;
          }
        }
        
        const totalBonusPriceMin = obs.price_min_total - obs.base_price_min;
        const totalBonusPriceX2 = obs.price_x2_total - obs.base_price_x2;
        const totalBonusRep = obs.rep_total - obs.base_reputation;
        
        const deducedPriceMin = (totalBonusPriceMin - knownBonusPriceMin) / unknownCount;
        const deducedPriceX2 = (totalBonusPriceX2 - knownBonusPriceX2) / unknownCount;
        const deducedRep = (totalBonusRep - knownBonusRep) / unknownCount;
        
        // Initialize array if it doesn't exist
        if (!learnedValues[unknownRarity]) {
          learnedValues[unknownRarity] = [];
        }
        
        learnedValues[unknownRarity].push({
          priceMin: deducedPriceMin,
          priceX2: deducedPriceX2,
          rep: deducedRep,
          count: 1
        });
        
        console.log(`[Déduction Iter ${iteration+1}] Config Mixte -> 1 ${unknownRarity} = ${Math.round(deducedPriceMin)}€ (Min) | ${Math.round(deducedPriceX2)}€ (x2)`);
        knowns[unknownRarity] = { priceMin: deducedPriceMin, priceX2: deducedPriceX2, rep: deducedRep, count: 1 };
        deductionsMade = true;
      }
    }
    if (!deductionsMade) break;
  }

  return getKnownAverages();
}

export async function runCompleteLearning(): Promise<void> {
  console.log("🚀 Lancement des 5 algorithmes d'apprentissage indépendants...");

  try {
    const { data: rawObs, error } = await supabase
      .from("observations")
      .select(`
        *,
        cars!inner(
          id,
          base_price_min,
          type_id
        )
      `)
      .not("price_min_total", "is", null)
      .not("price_x2", "is", null);

    if (error) throw error;

    const { data: carTypes, error: carTypesError } = await supabase
      .from("car_types")
      .select("id, k_multiplier_avg");

    if (carTypesError) throw carTypesError;

    const kMultiplierByType = (carTypes ?? []).reduce<Record<number, number>>((acc, carType) => {
      acc[carType.id] = carType.k_multiplier_avg || 1;
      return acc;
    }, {});

    // Mapping des observations
    const observations: ObservationData[] = rawObs.map(obs => {
      const parts: Record<string, number> = {};
      const addPart = (rarity: string | null) => {
        const normalizedRarity = normalizeRarityLabel(rarity);
        if (normalizedRarity && normalizedRarity !== "Stock") {
          parts[normalizedRarity] = (parts[normalizedRarity] || 0) + 1;
        }
      };
      
      addPart(obs.engine_rarity);
      addPart(obs.clutch_rarity);
      addPart(obs.turbo1_rarity);
      addPart(obs.turbo2_rarity);
      addPart(obs.suspension1_rarity);
      addPart(obs.suspension2_rarity);
      addPart(obs.transmission_rarity);
      addPart(obs.tires_rarity);

      return {
        id: obs.id,
        car_id: obs.car_id,
        type_id: obs.cars.type_id,
        base_price_min: obs.cars.base_price_min || 0,
        base_price_x2: 0, // À déterminer
        price_min_total: obs.price_min_total || 0,
        price_x2_total: obs.price_x2 || 0,
        rep_total: obs.rep_total || 0,
        base_reputation: 0,
        parts
      };
    });

    // Déterminer les valeurs de base (Stock) pour chaque voiture
    const stockObsByCarId: Record<number, { rep: number, priceX2: number }> = {};
    observations.forEach(o => {
      if (Object.keys(o.parts).length === 0) {
        stockObsByCarId[o.car_id] = {
          rep: o.rep_total,
          priceX2: o.price_x2_total
        };
      }
    });
    
    observations.forEach(o => {
      if (stockObsByCarId[o.car_id]) {
        o.base_reputation = stockObsByCarId[o.car_id].rep;
        o.base_price_x2 = stockObsByCarId[o.car_id].priceX2;
        return;
      }

      const fallbackK =
        kMultiplierByType[o.type_id] && kMultiplierByType[o.type_id] > 0
          ? kMultiplierByType[o.type_id]
          : 1;

      o.base_price_x2 = o.base_price_min * fallbackK;
    });

    // Séparation STRICTE par type
    const obsByTypeId: Record<number, ObservationData[]> = {
      1: [], 2: [], 3: [], 4: [], 5: []
    };
    
    observations.forEach(obs => {
      if (obsByTypeId[obs.type_id]) obsByTypeId[obs.type_id].push(obs);
    });

    // Exécution des 5 algorithmes
    const typeResults: Record<number, Record<string, { priceMin: number, priceX2: number, rep: number, count: number }>> = {};
    
    typeResults[1] = runAlgorithmForCarType(1, "Singulière", obsByTypeId[1]);
    typeResults[2] = runAlgorithmForCarType(2, "Rare", obsByTypeId[2]);
    typeResults[3] = runAlgorithmForCarType(3, "Epique", obsByTypeId[3]);
    typeResults[4] = runAlgorithmForCarType(4, "Légendaire", obsByTypeId[4]);
    typeResults[5] = runAlgorithmForCarType(5, "Secrète", obsByTypeId[5]);

    // Enregistrement en BDD
    console.log("💾 Mise à jour de la base de données...");
    
    await supabase.from("part_weights_by_type").delete().neq("car_type_id", 0);

    for (const [typeIdStr, rarities] of Object.entries(typeResults)) {
      const typeId = parseInt(typeIdStr);
      for (const [rarity, data] of Object.entries(rarities)) {
        if (isNaN(data.priceMin) || data.priceMin < 0) continue;
        if (isNaN(data.priceX2) || data.priceX2 < 0) continue;

        await supabase.from("part_weights_by_type").insert({
          car_type_id: typeId,
          part_rarity: rarity,
          bonus_price_min_avg: Math.round(data.priceMin),
          bonus_price_x2_avg: Math.round(data.priceX2),
          bonus_reputation_avg: Math.round(data.rep),
          observation_count: data.count
        });
      }
    }

    // CRITICAL: Calculate and update k_multiplier_avg for each car type
    // k_multiplier = average(price_x2 / price_min) for STOCK observations
    console.log("📊 Calcul des multiplicateurs k par type de voiture...");
    
    for (const typeId of [1, 2, 3, 4, 5]) {
      const stockObsForType = obsByTypeId[typeId].filter(o => Object.keys(o.parts).length === 0);
      
      if (stockObsForType.length > 0) {
        const kValues: number[] = [];
        
        stockObsForType.forEach(obs => {
          if (obs.base_price_min > 0 && obs.price_x2_total > 0) {
            const k = obs.price_x2_total / obs.base_price_min;
            kValues.push(k);
          }
        });
        
        if (kValues.length > 0) {
          const kAvg = kValues.reduce((a, b) => a + b, 0) / kValues.length;
          
          await supabase
            .from("car_types")
            .update({
              k_multiplier_avg: kAvg,
              k_observation_count: kValues.length
            })
            .eq("id", typeId);
          
          console.log(`Type ${typeId}: k_multiplier = ${kAvg.toFixed(2)} (${kValues.length} obs stock)`);
        }
      }
    }

    // CRITICAL: Calculate GLOBAL averages across all types and store in part_weights
    console.log("\n📊 Calcul des moyennes GLOBALES pour part_weights...");
    
    const globalAverages: Record<string, { priceMin: number[], priceX2: number[], rep: number[], count: number }> = {
      Gris: { priceMin: [], priceX2: [], rep: [], count: 0 },
      Singuliere: { priceMin: [], priceX2: [], rep: [], count: 0 },
      Rare: { priceMin: [], priceX2: [], rep: [], count: 0 },
      Epique: { priceMin: [], priceX2: [], rep: [], count: 0 },
      Legendaire: { priceMin: [], priceX2: [], rep: [], count: 0 },
      Secrete: { priceMin: [], priceX2: [], rep: [], count: 0 }
    };

    // Agréger tous les résultats par type pour calculer les moyennes globales
    for (const [typeIdStr, rarities] of Object.entries(typeResults)) {
      for (const [rarity, data] of Object.entries(rarities)) {
        if (globalAverages[rarity]) {
          globalAverages[rarity].priceMin.push(data.priceMin);
          globalAverages[rarity].priceX2.push(data.priceX2);
          globalAverages[rarity].rep.push(data.rep);
          globalAverages[rarity].count += data.count;
        }
      }
    }

    // Calculer et insérer les moyennes globales
    await supabase.from("part_weights").delete().neq("rarity", "");

    for (const [rarity, data] of Object.entries(globalAverages)) {
      if (data.priceMin.length > 0) {
        const avgPriceMin = data.priceMin.reduce((a, b) => a + b, 0) / data.priceMin.length;
        const avgPriceX2 = data.priceX2.reduce((a, b) => a + b, 0) / data.priceX2.length;
        const avgRep = data.rep.reduce((a, b) => a + b, 0) / data.rep.length;

        await supabase.from("part_weights").insert({
          rarity: rarity,
          bonus_price_min_avg: Math.round(avgPriceMin),
          bonus_price_x2_avg: Math.round(avgPriceX2),
          bonus_reputation_avg: Math.round(avgRep),
          observation_count: data.count
        });

        console.log(`Global ${rarity}: Min = ${Math.round(avgPriceMin)}€, x2 = ${Math.round(avgPriceX2)}€, Rep = ${Math.round(avgRep)} (${data.count} obs)`);
      }
    }

    console.log("✅ Apprentissage terminé avec succès !");
  } catch (error) {
    console.error("❌ Échec de l'apprentissage:", error);
    throw error;
  }
}