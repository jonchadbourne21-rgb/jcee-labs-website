import { createHash } from "crypto";

export type AuthorityIdentity = {
  namespace: string;
  authorityKey: string;
  generation: number;
  sigma: string;
  mechanism: string;
};

export function authorityFromDurableRecord(
  recordType: string,
  recordId: number,
  effect: string
): AuthorityIdentity {
  if (!Number.isInteger(recordId) || recordId <= 0) {
    throw new Error("AUTHORITY_IDENTITY_UNAVAILABLE");
  }
  if (!recordType || !effect) {
    throw new Error("AUTHORITY_IDENTITY_UNAVAILABLE");
  }

  const namespace = "jcee.website.direct-request.v1";
  const authorityKey = `${recordType}:${recordId}:${effect}`;
  const generation = recordId;
  const mechanism = "DURABLE_HUMAN_REQUEST_RECORD";

  const sigma = createHash("sha256")
    .update(
      [
        namespace,
        authorityKey,
        String(generation),
        mechanism,
      ].join("|")
    )
    .digest("hex");

  return {
    namespace,
    authorityKey,
    generation,
    sigma,
    mechanism,
  };
}

export function requireAuthority(
  value: AuthorityIdentity | null | undefined
): AuthorityIdentity {
  if (
    !value ||
    !value.namespace ||
    !value.authorityKey ||
    !Number.isInteger(value.generation) ||
    value.generation < 0 ||
    !/^[0-9a-f]{64}$/.test(value.sigma) ||
    !value.mechanism
  ) {
    throw new Error("AUTHORITY_IDENTITY_UNAVAILABLE");
  }
  return value;
}

export function authorityHeaders(
  value: AuthorityIdentity
): Record<string, string> {
  const authority = requireAuthority(value);
  return {
    "x-jcee-authority-namespace": authority.namespace,
    "x-jcee-authority-key": authority.authorityKey,
    "x-jcee-authority-generation": String(authority.generation),
    "x-jcee-authority-sigma": authority.sigma,
    "x-jcee-authority-mechanism": authority.mechanism,
  };
}
