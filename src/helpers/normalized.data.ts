export function normalizeDynamoDBData(data: any): any {
  const normalizedData = {};

  for (const key in data) {
    if (data[key].S !== undefined) {
      normalizedData[key] = data[key].S;
    } else if (data[key].N !== undefined) {
      normalizedData[key] = Number(data[key].N);
    } else if (data[key].M !== undefined) {
      normalizedData[key] = this.normalizeDynamoDBData(data[key].M);
    } else if (data[key].L !== undefined) {
      normalizedData[key] = data[key].L.map((item: any) =>
        this.normalizeDynamoDBData(item),
      );
    } else {
      normalizedData[key] = data[key];
    }
  }

  return normalizedData;
}

function denormalizeDynamoDBData(data: any): any {
  const result: any = {};

  for (const key in data) {
    if (typeof data[key] === 'string') {
      result[key] = { S: data[key] };
    } else if (typeof data[key] === 'number') {
      result[key] = { N: String(data[key]) };
    } else {
      // Puedes agregar más tipos si es necesario
      result[key] = data[key];
    }
  }

  return result;
}
