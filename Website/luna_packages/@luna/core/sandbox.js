/**
 * LUNA Sandbox - Capability-based security
 */
class Sandbox {
  constructor(capabilities = []) {
    this.capabilities = new Set(capabilities);
  }

  check(capability) {
    if (!this.capabilities.has(capability)) {
      throw new Error(`SecurityError: capability "${capability}" not granted`);
    }
    return true;
  }

  grant(capability) {
    this.capabilities.add(capability);
    return this;
  }

  revoke(capability) {
    this.capabilities.delete(capability);
    return this;
  }
}

module.exports = Sandbox;
