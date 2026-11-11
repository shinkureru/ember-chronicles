import type { SoundscapeId } from './soundscapes';

/** Every track is redistributed locally under the original author's CC0-1.0 release.
 * Identical OGG bytes, no on-demand external streaming or procedural BGM.
 * See docs/V15_MUSIC_LICENSES.md for original upstream evidence and links. */
export const LICENSED_TRACKS={
 darkShrine:{filename:'oga-dark-shrine.ogg',title:'Dark Shrine Loop',author:'qubodup (based on yd)',source:'https://opengameart.org/content/dark-shrine-loop',license:'CC0-1.0'},
 cityPulse:{filename:'busy-cyberworld.ogg',title:'Sci-fi City — Busy Cyberworld',author:'TinyWorlds',source:'https://opengameart.org/content/scifi-city-ambient-loop',license:'CC0-1.0'},
 nightMenu:{filename:'qubodup-menu-loop.ogg',title:'Menu Music Loop (Tiggo)',author:'qubodup',source:'https://opengameart.org/content/two-simple-game-music-loops',license:'CC0-1.0'},
 battle:{filename:'qubodup-battle-loop.ogg',title:'Level Music Loop (Tigrun)',author:'qubodup',source:'https://opengameart.org/content/two-simple-game-music-loops',license:'CC0-1.0'},
 refuge:{filename:'wipics-menu-loop.ogg',title:'Menu Music',author:'wipics',source:'https://opengameart.org/content/menu-music-1',license:'CC0-1.0'},
} as const;

export type LicensedTrackId=keyof typeof LICENSED_TRACKS;

/** Location tracks can repeat across similar spaces, but world/city, missions and combat never use the same file. */
export const SCENE_TRACKS:Record<SoundscapeId,LicensedTrackId|null>={
 map:'darkShrine',
 town:'refuge',
 market:'cityPulse',
 warehouse:'nightMenu',
 gate:'cityPulse', survey:'darkShrine', inside:'nightMenu', confrontation:'battle', loot:'darkShrine',
 result:'refuge', sewer:'darkShrine',silence:null,
 alley_gate:'cityPulse',alley_survey:'darkShrine',alley_inside:'nightMenu',alley_confrontation:'battle',alley_loot:'darkShrine',
};
export const musicPath=(track:LicensedTrackId)=>`${import.meta.env.BASE_URL}audio/cc0-music/${LICENSED_TRACKS[track].filename}`;
