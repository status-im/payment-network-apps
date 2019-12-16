const MerchantsRegistry = require('Embark/contracts/MerchantsRegistry');
const { getErrorReason } = require('./utils');

let owner,
  otherUser,
  merchant;

config({}, (err, _accounts) => {
  owner = _accounts[0];
  otherUser = _accounts[1];
  merchant = _accounts[2];
});

contract('MerchantsRegistry - setOwner', () => {
  let MerchantsRegistryInstance;

  before(async () => {
    MerchantsRegistryInstance = await MerchantsRegistry.deploy().send();
  });

  it('requires owner to change owner', async () => {
    const actualOwner = await MerchantsRegistryInstance.methods.owner().call();
    assert.equal(actualOwner, owner);

    const setOwner = await MerchantsRegistryInstance.methods.setOwner(merchant);
    try {
      await setOwner.send({ from: otherUser });
      assert.fail("setOwner should have failed");
    } catch (err) {
      assert(getErrorReason(err), "owner required")
    }
  });

  it('allows owner to change owner', async () => {
    const ownerBefore = await MerchantsRegistryInstance.methods.owner().call();
    assert.equal(ownerBefore, owner);

    const setOwner = await MerchantsRegistryInstance.methods.setOwner(otherUser);
    await setOwner.send({ from: owner });

    const ownerAfter = await MerchantsRegistryInstance.methods.owner().call();
    assert.ok(ownerBefore != ownerAfter);
    assert.equal(ownerAfter, otherUser);
  });
});

contract('MerchantsRegistry - add/remove Merchant', () => {
  let MerchantsRegistryInstance;

  before(async () => {
    MerchantsRegistryInstance = await MerchantsRegistry.deploy().send();
  });

  it('requires owner to use addMerchant', async () => {
    const actualOwner = await MerchantsRegistryInstance.methods.owner().call();
    assert.equal(actualOwner, owner);

    const addMerchant = await MerchantsRegistryInstance.methods.addMerchant(merchant);
    try {
      await addMerchant.send({ from: otherUser });
      assert.fail("addMerchant should have failed");
    } catch (err) {
      assert(getErrorReason(err), "owner required")
    }
  });

  it('allows to add merchants', async () => {
    const isPresentBefore = await MerchantsRegistryInstance.methods.merchants(merchant).call();
    assert.ok(!isPresentBefore)

    const addMerchant = await MerchantsRegistryInstance.methods.addMerchant(merchant);
    await addMerchant.send({ from: owner });

    const isPresentAfter = await MerchantsRegistryInstance.methods.merchants(merchant).call();
    assert.ok(isPresentAfter)
  });

  it('requires owner to use removeMerchant', async () => {
    const actualOwner = await MerchantsRegistryInstance.methods.owner().call();
    assert.equal(actualOwner, owner);

    const removeMerchant = await MerchantsRegistryInstance.methods.removeMerchant(merchant);
    try {
      await removeMerchant.send({ from: otherUser });
      assert.fail("removeMerchant should have failed");
    } catch (err) {
      assert(getErrorReason(err), "owner required")
    }
  });

  it('allows to remove merchants', async () => {
    const isPresentBefore = await MerchantsRegistryInstance.methods.merchants(merchant).call();
    assert.ok(isPresentBefore)

    const removeMerchant = await MerchantsRegistryInstance.methods.removeMerchant(merchant);
    await removeMerchant.send({ from: owner });

    const isPresentAfter = await MerchantsRegistryInstance.methods.merchants(merchant).call();
    assert.ok(!isPresentAfter)
  });
})
