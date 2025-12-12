const mapper = {
  mapDeal: (deal) => ({
    properties: {
      dealname: deal.name,
      amount: deal.value,
      pipeline: "Updated Pipeline",
      capsule_id: deal.id
    }
  })
};

export default mapper;

