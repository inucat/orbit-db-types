declare module "@orbitdb/core" {
  import EventEmitter from "events";
  import type { Helia, HeliaInit, HeliaLibp2p } from "helia";

  export type Database = {
    type: string;
    addOperation: (args: {
      op: string;
      key: string | null;
      value: unknown;
    }) => Promise<string>;
    address: string;
    close(): Promise<void>;
    drop(): Promise<void>;
    events: EventEmitter<{ update: [entry: LogEntry] }>;
    access: AccessController;
    log: Log;
  };

  export function Database(args: {
    ipfs: Helia;
    identity?: Identity;
    address: string;
    name?: string;
    access?: AccessController;
    directory?: string;
    meta?: object;
    headsStorage?: Storage;
    entryStorage?: Storage;
    indexStorage?: Storage;
    referencesCount?: number;
    syncAutomatically?: boolean;
    onUpdate?: () => void;
  }): Promise<Database>;

  module Databases {
    type Events = Database & {
      add: (value: any) => Promise<string>;
      get: (hash: string) => Promise<any | null>;
      iterator: <TReturn = any, TNext = unknown>(filters?: {
        gt?: string;
        gte?: string;
        lt?: string;
        lte?: string;
        amount?: string;
      }) => AsyncGenerator<{ hash: any; value: any }, TReturn, TNext>;
      all: () => Promise<[hash: string, value: string][]>;
    };

    type Documents = Database & {
      put: (doc: Object) => Promise<string>;
      all: () => Promise<[string, string, string][]>;
      del: (key: string) => Promise<string>;
      get: (key: string) => Promise<Object | null>;
      iterator: (filters?: {
        amount?: string;
      }) => AsyncGenerator<{ hash: any; key: any; value: any }, void, unknown>;
      query: (findFn: (doc: any) => WithImplicitCoercion<boolean>) => [];
    };

    type KeyValue<T = any> = Database & {
      put: (key: string, value: T) => Promise<string>;
      del: (key: string) => Promise<any>;
      get: (key: string) => Promise<T>;
      all: () => Promise<{ key: string; value: T; hash: string }[]>;
      iterator: (filters?: {
        amount?: string;
      }) => AsyncGenerator<
        { key: string; value: T; hash: string },
        void,
        unknown
      >;
    };
  }

  export type Identity = {
    id: string;
    publicKey: string;
    signatures: {
      id: string;
      publicKey: string;
    };
    type: string;
    sign: (identity: Identity, data: string) => Promise<string>;
    verify: (
      signature: string,
      publicKey: string,
      data: string
    ) => Promise<boolean>;
  };

  export type OrbitDB = {
    id: string;
    open: (
      address: string,
      params?: OrbitDBDatabaseOptions
    ) => ReturnType<typeof Database>;
    stop;
    ipfs;
    directory;
    keystore;
    identity: Identity;
    peerId;
  };
  export function createOrbitDB(params: {
    ipfs: Helia;
    id?: string;
    identity?: Identity | { provider?: Function };
    identities?: Identities;
    directory?: string;
  }): Promise<OrbitDB>;

  export function useAccessController(accessController: { type: string }): void;
  export function isValidAddress(address: unknown): boolean;

  export type Log = {
    id;
    clock: Clock;
    heads: () => Promise<LogEntry[]>;
    traverse: () => AsyncGenerator<LogEntry, void, unknown>;
  };

  export function AccessControllerGenerator(options: {
    orbitdb: OrbitDB;
    identities: IdentitiesType;
    address?: string;
  }): Promise<AccessController>;

  export class AccessController {
    type: string;
    address: string;
    canAppend: (entry: LogEntry) => Promise<boolean>;
  }

  export function useDatabaseType(type: { type: string }): void;

  export function IPFSAccessController(options: {
    write?: string[];
    storage?: Storage;
  }): (args: {
    orbitdb: OrbitDB;
    identities: IdentitiesType;
    address?: string;
  }) => Promise<
    AccessController & {
      type: "ipfs";
      address: string;
      write: string[];
      canAppend: (entry: LogEntry) => Promise<boolean>;
    }
  >;
  export function Identities(args: {
    keystore?: KeyStoreType;
    path?: string;
    storage?: Storage;
    ipfs?: Helia;
  }): Promise<IdentitiesType>;
  export class IdentitiesType {
    createIdentity;
    getIdentity;
    verifyIdentity: (identity) => boolean;
    sign;
    verify;
    keystore;
  }
  export const Entry: {
    create: (
      identity: Identity,
      id: string,
      payload: unknown,
      clock?: Clock,
      next?: string[],
      refs?: string[]
    ) => Promise<LogEntry>;
    verify: (identities: IdentitiesType, entry: LogEntry) => Promise<boolean>;
    decode: (bytes: Uint8Array) => Promise<LogEntry>;
    isEntry: (obj: object) => boolean;
    isEqual: (a: LogEntry, b: LogEntry) => boolean;
  };
  export class Storage {
    put;
    get;
  }
  export function IPFSBlockStorage({
    ipfs: IPFS,
    pin: boolean,
  }): Promise<Storage>;
  export function LRUStorage({ size: number }): Promise<Storage>;
  export function ComposedStorage(...args: Storage[]): Promise<Storage>;

  export type OrbitDBDatabaseOptions = {
    type?: string;
    AccessController?: typeof AccessControllerGenerator;
    syncAutomatically?: boolean;
    sync?: boolean;
    Database?: Database;
    headsStorage?: Storage;
    entryStorage?: Storage;
    indexStorage?: Storage;
    referencesCount?: number;
  };

  export type Clock = {
    id: string;
    time: number;
  };

  export type LogEntry<T = unknown> = {
    id: string;
    payload: { op: string; key: string | null; value?: T };
    next: string[];
    refs: string[];
    clock: Clock;
    v: Number;
    key: string;
    identity: string;
    sig: string;
    hash: string;
  };

  export type KeyValue = {
    type: "keyvalue";
    address: string;
    put(key: string, value: unknown): Promise<string>;
    set: KeyValue["put"];
    del(key: string): Promise<string>;
    get(key: string): Promise<unknown | undefined>;
    all(): Promise<{ key: string; value: unknown; hash: string }[]>;
    close(): Promise<void>;
    drop(): Promise<void>;
    events: EventEmitter;
    access: AccessController;
    log: Log;
  };

  export function KeyStore(args: {
    storage?: Storage;
    path?: string;
  }): Promise<KeyStoreType>;

  export type KeyStoreType = {
    clear;
    close;
    hasKey;
    addKey;
    createKey;
    getKey;
    getPublic;
  };
}
