# loopback4-soft-delete

[![LoopBack](<https://github.com/strongloop/loopback-next/raw/master/docs/site/imgs/branding/Powered-by-LoopBack-Badge-(blue)-@2x.png>)](http://loopback.io/)

[![Node version](https://img.shields.io/node/v/loopback4-meta-info.svg?style=flat-square)](https://nodejs.org/en/download/)
[![Dependencies Status](https://img.shields.io/david/Vn-ChemGio/loopback4-meta-info.svg?style=flat-square)](https://github.com/sourcefuse/loopback4-meta-info)
[![Loopback Core Version](https://img.shields.io/npm/dependency-version/loopback4-meta-info/@loopback/core?style=flat-square)](https://github.com/strongloop/loopback-next)
[![Loopback Build Version](https://img.shields.io/npm/dependency-version/loopback4-meta-info/dev/@loopback/build.svg?color=dark%20green&style=flat-square)](https://github.com/strongloop/loopback-next/tree/master/packages/build)
[![npm vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/loopback4-meta-info.svg?label=npm%20vulnerabilities&style=flat-square)](https://www.npmjs.com/package/loopback4-meta-info)

[![Latest version](https://img.shields.io/npm/v/loopback4-meta-info.svg?style=flat-square)](https://www.npmjs.com/package/loopback4-soft-delete)
[![License](https://img.shields.io/github/license/Vn-ChemGio/loopback4-meta-info.svg?color=blue&label=License&style=flat-square)](https://github.com/sourcefuse/loopback4-meta-info/blob/master/LICENSE)
[![Downloads](https://img.shields.io/npm/dw/loopback4-meta-info.svg?label=Downloads&style=flat-square&color=blue)](https://www.npmjs.com/package/loopback4-meta-info)
[![Total Downloads](https://img.shields.io/npm/dt/loopback4-meta-info.svg?label=Total%20Downloads&style=flat-square&color=blue)](https://www.npmjs.com/package/loopback4-meta-info)

## Install

```sh
npm install loopback4-meta-info
```

**NOTE** - It only support loopback4.

```sh
npm install loopback4-meta-info
```

## Quick Starter

For a quick starter guide, you can refer to our [loopback 4 starter](https://github.com/sourcefuse/loopback4-starter) application which utilizes this package for soft-deletes in a multi-tenant application.

## Transaction support

With version 3.0.0, transaction repository support has been added. In place of SoftCrudRepository, extend your repository with DefaultTransactionSoftCrudRepository. For further usage guidelines, refer below.

## Usage

Right now, this extension exports three abstract classes which are actually helping with soft delete operations.

- **MetaEntity** -
  An abstract base class for all models which require soft delete feature.
  This class is a wrapper over Entity class from [@loopback/repository](https://github.com/strongloop/loopback-next/tree/master/packages/repository) adding three attributes to the model class for handling soft-delete, namely, deleted, deletedOn, deletedBy, and some meta createdBy, updatedBy, createdOn, updatedOn
  The column names needed to be there in DB within that table are - 'created_on', 'created_by', 'updated_on', 'updated_by','deleted', 'deleted_on', 'deleted_by'.
  If you are using auto-migration of loopback 4, then, you may not need to do anything specific to add this column.
  If not, then please add these columns to the DB table.
- **SoftMetaCrudRepository** -
  An abstract base class for all repositories which require soft delete feature.
  This class is going to be the one which handles soft delete operations and ensures soft deleted entries are not returned in responses, However if there is a need to query soft deleted entries as well,there is an options to achieve that and you can use findAll() in place of find() , findOneIncludeSoftDelete() in place of findOne() and findByIdIncludeSoftDelete() in place of findById(), these will give you the responses including soft deleted entries.
  This class is a wrapper over DefaultCrudRepository class from [@loopback/repository](https://github.com/strongloop/loopback-next/tree/master/packages/repository).

In order to use this extension in your LB4 application, please follow below steps.

1. Extend models with SoftDeleteEntity class replacing Entity. For example,

```ts
import {model, property} from '@loopback/repository';
import {SoftMetaCrudRepository} from 'loopback4-meta-info';

@model({
  name: 'users',
})
export class User extends SoftMetaCrudRepository {
  @property({
    type: 'number',
    id: true,
  })
  id?: number;

  // .... More properties
}
```

2. Extend repositories with SoftMetaCrudRepository class replacing DefaultCrudRepository. For example,

```ts
import {Getter, inject} from '@loopback/core';
import {SoftCrudRepository} from 'loopback4-meta-info';
import {SecurityBindings, securityId, UserProfile} from '@loopback/security';

import {PgdbDataSource} from '../datasources';
import {User, UserRelations} from '../models';

export class UserRepository extends SoftMetaCrudRepository<
  User,
  typeof User.prototype.id,
  UserRelations
> {
  constructor(
    @inject('datasources.pgdb') dataSource: PgdbDataSource,
    @inject.getter(SecurityBindings.USER, {optional: true})
    protected readonly getCurrentUser: Getter< UserProfile | undefined>,
  ) {
    super(User, dataSource, getCurrentUser);
  }
}
```



## License

[MIT](https://github.com/Vn-ChemGio/@loopback4/meta-info/blob/master/LICENSE)
