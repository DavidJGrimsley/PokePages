import React from 'react';
import { Stack } from 'expo-router';
import { ScrollView } from 'react-native';
import { Build } from '~/components/Build';

export default function WoChienBuilds() {
  return (
    <>
      <Stack.Screen options={{ title: 'Wo Chien Builds' }} />
      <ScrollView style={{ flex: 1, backgroundColor: '#f8f9fa' }}>
        {/* <Text style={styles.sectionTitle}></Text> */}
        {/* Physical Attacker Example */}
        <Build
          pokemonName="Garchomp"
          variant="physical-attacker"
          ability="Rough Skin"
          nature="Jolly (+Spe, -SpA)"
          level={50}
          evs={{
            hp: 4,
            attack: 252,
            defense: 0,
            specialAttack: 0,
            specialDefense: 0,
            speed: 252
          }}
          heldItem="Choice Scarf"
          teraType="Dragon"
          moves={[
            "Earthquake",
            "Outrage",
            "Stone Edge",
            "Fire Fang"
          ]}
          role="Fast physical sweeper that can revenge kill threats and break through defensive cores with powerful STAB moves."
          notes="Choice Scarf allows outspeeding most threats. Tera Dragon boosts Outrage to massive damage levels."
        />

        {/* Special Attacker Example */}
        <Build
          pokemonName="Hydreigon"
          variant="special-attacker"
          ability="Levitate"
          nature="Modest (+SpA, -Atk)"
          level={50}
          evs={{
            hp: 4,
            attack: 0,
            defense: 0,
            specialAttack: 252,
            specialDefense: 0,
            speed: 252
          }}
          heldItem="Life Orb"
          teraType="Dark"
          moves={[
            "Dark Pulse",
            "Draco Meteor",
            "Fire Blast",
            "Earth Power"
          ]}
          role="Powerful special attacker with excellent coverage. Life Orb boosts damage output significantly."
          notes="Tera Dark makes Dark Pulse incredibly powerful. Earth Power hits Steel-types that resist other moves."
        />

        {/* Physical Wall Example (your original example) */}
        <Build
          pokemonName="Espeon"
          variant="physical-wall"
          ability="Synchronize"
          nature="Bold (+Def, -Atk)"
          level={50}
          evs={{
            hp: 252,
            attack: 0,
            defense: 252,
            specialAttack: 0,
            specialDefense: 4,
            speed: 0
          }}
          heldItem="Leftovers"
          teraType="Grass"
          moves={[
            "Sunny Day",
            "Helping Hand",
            "Wish",
            "Protect"
          ]}
          role="Bulky sun setter that also heals teammates with Wish and boosts their damage with Helping Hand."
          notes="Leftovers provides consistent healing. Protect ensures Wish healing and scouts opponent moves."
        />

        {/* Special Wall Example */}
        <Build
          pokemonName="Blissey"
          variant="special-wall"
          ability="Natural Cure"
          nature="Calm (+SpD, -Atk)"
          level={50}
          evs={{
            hp: 252,
            attack: 0,
            defense: 4,
            specialAttack: 0,
            specialDefense: 252,
            speed: 0
          }}
          heldItem="Heavy-Duty Boots"
          teraType="Fairy"
          moves={[
            "Soft-Boiled",
            "Seismic Toss",
            "Toxic",
            "Stealth Rock"
          ]}
          role="Ultimate special wall that can absorb special attacks all day while providing team support with hazards and status."
          notes="Heavy-Duty Boots prevents hazard damage. Seismic Toss provides consistent damage regardless of Attack stat."
        />

      </ScrollView>
    </>
  );
}
