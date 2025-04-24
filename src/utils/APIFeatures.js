// Changed the name of APIFeatures.js to apiFeatures.js"
class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    // Handle nested array queries for systemProfiles
    if (queryObj.systemName) {
      const systemNameValue = queryObj.systemName;
      if (systemNameValue.startsWith("-")) {
        // Handle negative query (find members that don't have the specified systemName)
        queryObj["systemProfiles"] = {
          $not: { $elemMatch: { systemName: systemNameValue.substring(1) } },
        };
      } else {
        // Handle positive query (existing behavior)
        queryObj["systemProfiles"] = {
          $elemMatch: { systemName: systemNameValue },
        };
      }
      delete queryObj.systemName;
    }

    // 1B) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));

    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(",").join(" ");
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort("-createdAt");
    }

    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(",").join(" ");
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select(
        "-__v -createdAt -updatedAt -pwd -recoveryMail"
      );
    }

    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);

    return this;
  }
}
module.exports = APIFeatures;
