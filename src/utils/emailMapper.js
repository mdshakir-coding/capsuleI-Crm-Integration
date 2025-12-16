function mapNameToEmail(name) {
  if (!name || typeof name !== 'string') return null;

  // Normalize input: trim, lowercase, collapse spaces
  const normalize = (str) =>
    str.trim().toLowerCase().replace(/\s+/g, ' ');

  const normalizedInput = normalize(name);

  // Create a normalized map where keys are normalized names
  const nameEmailMap = {
    "andrew lindsay": "andrew.lindsay@getbriefed.com",
    "ben murphy": "ben.murphy@getbriefed.com",
    "chantal carragher": "chantal.carragher@getbriefed.com",
    "chris kelly": "chris.kelly@getbriefed.com",
    "cormac dunne": "cormac.dunne@getbriefed.com",
    "elliott rogers": "elliott.rogers@getbriefed.com",
    "georgia bourke": "georgia.bourke@getbriefed.com",
    "niamh thompson": "niamh.thompson@getbriefed.com",
    "orlagh kelly": "orlagh.kelly@getbriefed.com",
    "team briefed": "hello@getbriefed.com",
    "Briefed Finance": "georgia.bourke@getbriefed.com",
    "Ross McKenna":"cormac.dunne@getbriefed.com",

  };

  return nameEmailMap[normalizedInput] || null;
}

export{mapNameToEmail};