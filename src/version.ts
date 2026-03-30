// Copyright 2021 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import * as semver from 'semver';

const VERSION_REGEX =
  /^(?<major>\d+)\.(?<minor>\d+)\.(?<patch>\d+)(?:(?<preReleaseSeparator>-)(?<preRelease>[^+]+)|(?<pep440PreRelease>(?:a|b|rc)\d+))?(\+(?<build>.*))?$/;
const PEP440_PRERELEASE_REGEX = /^(?<label>a|b|rc)(?<number>\d+)$/;

function normalizedPrerelease(preRelease?: string): string | undefined {
  if (!preRelease) return preRelease;
  const match = preRelease.match(PEP440_PRERELEASE_REGEX);
  if (!match?.groups) return preRelease;
  return `${match.groups.label}.${match.groups.number}`;
}

/**
 * This data class is used to represent a SemVer version.
 */
export class Version {
  readonly major: number;
  readonly minor: number;
  readonly patch: number;
  readonly preRelease?: string;
  readonly build?: string;
  readonly preReleaseSeparator?: '-' | '';

  constructor(
    major: number,
    minor: number,
    patch: number,
    preRelease?: string,
    build?: string,
    preReleaseSeparator?: '-' | ''
  ) {
    this.major = major;
    this.minor = minor;
    this.patch = patch;
    this.preRelease = preRelease;
    this.build = build;
    this.preReleaseSeparator = preRelease
      ? preReleaseSeparator ?? '-'
      : undefined;
  }

  /**
   * Parse a version string into a data class.
   *
   * @param {string} versionString the input version string
   * @returns {Version} the parsed version
   * @throws {Error} if the version string cannot be parsed
   */
  static parse(versionString: string): Version {
    const match = versionString.match(VERSION_REGEX);
    if (!match?.groups) {
      throw Error(`unable to parse version string: ${versionString}`);
    }
    const major = Number(match.groups.major);
    const minor = Number(match.groups.minor);
    const patch = Number(match.groups.patch);
    const preRelease =
      match.groups.preRelease || match.groups.pep440PreRelease || undefined;
    const build = match.groups.build;
    const preReleaseSeparator = preRelease
      ? match.groups.preReleaseSeparator
        ? '-'
        : ''
      : undefined;
    return new Version(
      major,
      minor,
      patch,
      preRelease,
      build,
      preReleaseSeparator
    );
  }

  /**
   * Comparator to other Versions to be used in sorting.
   *
   * @param {Version} other The other version to compare to
   * @returns {number} -1 if this version is earlier, 0 if the versions
   *   are the same, or 1 otherwise.
   */
  compare(other: Version): -1 | 0 | 1 {
    return semver.compare(this.toSemverString(), other.toSemverString());
  }

  private toSemverString(): string {
    const preRelease = normalizedPrerelease(this.preRelease);
    const preReleasePart = preRelease ? `-${preRelease}` : '';
    const buildPart = this.build ? `+${this.build}` : '';
    return `${this.major}.${this.minor}.${this.patch}${preReleasePart}${buildPart}`;
  }

  /**
   * Returns a normalized string version of this version.
   *
   * @returns {string}
   */
  toString(): string {
    const preReleasePart = this.preRelease
      ? `${this.preReleaseSeparator ?? '-'}${this.preRelease}`
      : '';
    const buildPart = this.build ? `+${this.build}` : '';
    return `${this.major}.${this.minor}.${this.patch}${preReleasePart}${buildPart}`;
  }

  get isPreMajor(): boolean {
    return this.major < 1;
  }
}

export type VersionsMap = Map<string, Version>;
