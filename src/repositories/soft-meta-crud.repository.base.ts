import {Getter, inject} from '@loopback/core';
import {
  AndClause,
  Condition,
  DataObject,
  DefaultCrudRepository,
  Entity,
  Filter,
  juggler,
  OrClause,
  Where,
} from '@loopback/repository';
import {Count} from '@loopback/repository/src/common-types';
import {HttpErrors} from '@loopback/rest';
import {SecurityBindings, UserProfile} from '@loopback/security';

import {Options} from 'loopback-datasource-juggler';

import {ErrorKeys} from '../error-keys';
import {MetaEntity} from '../models';

export abstract class SoftMetaCrudRepository<
  T extends MetaEntity,
  ID,
  Relations extends object = {}
> extends DefaultCrudRepository<T, ID, Relations> {
  protected constructor(
    entityClass: typeof Entity & {
      prototype: T;
    },
    dataSource: juggler.DataSource,
    @inject(SecurityBindings.USER, {optional: true})
    protected getCurrentUser?: Getter<UserProfile | undefined>,
  ) {
    super(entityClass, dataSource);
  }

  async create(
    entity: DataObject<T>,
    options?: Options,
    headers?: Object,
  ): Promise<T> {
    return super.create(await this.prepaidEntity(entity), options);
  }

  async createAll(entities: DataObject<T>[], options?: Options): Promise<T[]> {
    const userId = await this.getUserId();
    for (const entity of entities)
      await this.prepaidEntity(entity, false, userId);

    return super.createAll(entities, options);
  }

  find(filter?: Filter<T>, options?: Options): Promise<(T & Relations)[]> {
    // Filter out soft deleted entries
    if (
      filter?.where &&
      (filter.where as AndClause<T>).and &&
      (filter.where as AndClause<T>).and.length > 0
    ) {
      (filter.where as AndClause<T>).and.push({
        deleted: false,
      } as Condition<T>);
    } else if (
      filter?.where &&
      (filter.where as OrClause<T>).or &&
      (filter.where as OrClause<T>).or.length > 0
    ) {
      filter.where = {
        and: [
          {
            deleted: false,
          } as Condition<T>,
          {
            or: (filter.where as OrClause<T>).or,
          },
        ],
      };
    } else {
      filter = filter ?? {};
      filter.where = filter.where ?? {};
      (filter.where as Condition<T>).deleted = false;
    }

    // Now call super
    return super.find(filter, options);
  }

  //find all enteries including soft deleted records
  findAll(filter?: Filter<T>, options?: Options): Promise<(T & Relations)[]> {
    return super.find(filter, options);
  }

  findOne(
    filter?: Filter<T>,
    options?: Options,
  ): Promise<(T & Relations) | null> {
    // Filter out soft deleted entries
    if (
      filter?.where &&
      (filter.where as AndClause<T>).and &&
      (filter.where as AndClause<T>).and.length > 0
    ) {
      (filter.where as AndClause<T>).and.push({
        deleted: false,
      } as Condition<T>);
    } else if (
      filter?.where &&
      (filter.where as OrClause<T>).or &&
      (filter.where as OrClause<T>).or.length > 0
    ) {
      filter.where = {
        and: [
          {
            deleted: false,
          } as Condition<T>,
          {
            or: (filter.where as OrClause<T>).or,
          },
        ],
      };
    } else {
      filter = filter ?? {};
      filter.where = filter.where ?? {};
      (filter.where as Condition<T>).deleted = false;
    }

    // Now call super
    return super.findOne(filter, options);
  }

  //findOne() including soft deleted entry
  findOneIncludeSoftDelete(
    filter?: Filter<T>,
    options?: Options,
  ): Promise<(T & Relations) | null> {
    return super.findOne(filter, options);
  }

  async findById(
    id: ID,
    filter?: Filter<T>,
    options?: Options,
  ): Promise<T & Relations> {
    // Filter out soft deleted entries
    if (
      filter?.where &&
      (filter.where as AndClause<T>).and &&
      (filter.where as AndClause<T>).and.length > 0
    ) {
      (filter.where as AndClause<T>).and.push({
        deleted: false,
        id: id,
      } as Condition<T>);
    } else if (
      filter?.where &&
      (filter.where as OrClause<T>).or &&
      (filter.where as OrClause<T>).or.length > 0
    ) {
      filter.where = {
        and: [
          {
            deleted: false,
            id: id,
          } as Condition<T>,
          {
            or: (filter.where as OrClause<T>).or,
          },
        ],
      };
    } else {
      filter = filter ?? {};
      filter.where = {
        deleted: false,
        id: id,
      } as Condition<T>;
    }

    //As parent method findById have filter: FilterExcludingWhere<T>
    //so we need add check here.
    const entityToRemove = await super.findOne(filter, options);

    if (entityToRemove) {
      // Now call super
      return super.findById(id, filter, options);
    } else {
      throw new HttpErrors.NotFound(ErrorKeys.EntityNotFound);
    }
  }

  //find by Id including soft deleted record
  async findByIdIncludeSoftDelete(
    id: ID,
    filter?: Filter<T>,
    options?: Options,
  ): Promise<T & Relations> {
    //As parent method findById have filter: FilterExcludingWhere<T>
    //so we need add check here.
    const entityToRemove = await super.findOne(filter, options);

    if (entityToRemove) {
      // Now call super
      return super.findById(id, filter, options);
    } else {
      throw new HttpErrors.NotFound(ErrorKeys.EntityNotFound);
    }
  }

  async updateAll(
    data: DataObject<T>,
    where?: Where<T>,
    options?: Options,
  ): Promise<Count> {
    // Filter out soft deleted entries
    if (
      where &&
      (where as AndClause<T>).and &&
      (where as AndClause<T>).and.length > 0
    ) {
      (where as AndClause<T>).and.push({
        deleted: false,
      } as Condition<T>);
    } else if (
      where &&
      (where as OrClause<T>).or &&
      (where as OrClause<T>).or.length > 0
    ) {
      where = {
        and: [
          {
            deleted: false,
          } as Condition<T>,
          {
            or: (where as OrClause<T>).or,
          },
        ],
      };
    } else {
      where = where ?? {};
      (where as Condition<T>).deleted = false;
    }

    data.updatedOn = new Date();
    data.updatedBy = await this.getUserId();

    // Now call super
    return super.updateAll(data, where, options);
  }

  count(where?: Where<T>, options?: Options): Promise<Count> {
    // Filter out soft deleted entries
    if (
      where &&
      (where as AndClause<T>).and &&
      (where as AndClause<T>).and.length > 0
    ) {
      (where as AndClause<T>).and.push({
        deleted: false,
      } as Condition<T>);
    } else if (
      where &&
      (where as OrClause<T>).or &&
      (where as OrClause<T>).or.length > 0
    ) {
      where = {
        and: [
          {
            deleted: false,
          } as Condition<T>,
          {
            or: (where as OrClause<T>).or,
          },
        ],
      };
    } else {
      where = where ?? {};
      (where as Condition<T>).deleted = false;
    }

    // Now call super
    return super.count(where, options);
  }

  async delete(entity: T, options?: Options): Promise<void> {
    // Do soft delete, no hard delete allowed
    (entity as MetaEntity).deleted = true;
    (entity as MetaEntity).deletedOn = Math.floor(Date.now() / 1000);
    (entity as MetaEntity).deletedBy = await this.getUserId();
    return super.update(entity, options);
  }

  async deleteAll(where?: Where<T>, options?: Options): Promise<Count> {
    // Do soft delete, no hard delete allowed
    return this.updateAll(
      {
        deleted: true,
        deletedOn: Math.floor(Date.now() / 1000),
        deletedBy: await this.getUserId(),
      } as DataObject<T>,
      where,
      options,
    );
  }

  async deleteById(id: ID, options?: Options): Promise<void> {
    // Do soft delete, no hard delete allowed
    return super.updateById(
      id,
      {
        deleted: true,
        deletedOn: Math.floor(Date.now() / 1000),
        deletedBy: await this.getUserId(),
      } as DataObject<T>,
      options,
    );
  }

  /**
   * Method to perform hard delete of entries. Take caution.
   * @param entity
   * @param options
   */
  deleteHard(entity: T, options?: Options): Promise<void> {
    // Do hard delete
    return super.deleteById(entity.getId(), options);
  }

  /**
   * Method to perform hard delete of entries. Take caution.
   * @param entity
   * @param options
   */
  deleteAllHard(where?: Where<T>, options?: Options): Promise<Count> {
    // Do hard delete
    return super.deleteAll(where, options);
  }

  /**
   * Method to perform hard delete of entries. Take caution.
   * @param entity
   * @param options
   */
  deleteByIdHard(id: ID, options?: Options): Promise<void> {
    // Do hard delete
    return super.deleteById(id, options);
  }

  private async getUserId(options?: Options): Promise<string | undefined> {
    if (!this.getCurrentUser) {
      return undefined;
    }
    let currentUser = await this.getCurrentUser();
    currentUser = currentUser ?? options?.currentUser;
    if (!currentUser || !currentUser.id) return undefined;

    return currentUser.id.toString();
  }

  private async prepaidEntity(
    entity: DataObject<T>,
    getUserId = true,
    userId?: string,
  ): Promise<DataObject<T>> {
    entity.createdOn = entity.createdOn ?? Math.floor(Date.now() / 1000);
    entity.updatedOn = Math.floor(Date.now() / 1000);

    entity.createdBy =
      entity.createdBy ?? getUserId ? await this.getUserId() : userId;
    entity.updatedBy = entity.createdBy;

    //protected value
    delete entity.deleted;
    delete entity.deletedOn;
    delete entity.deletedBy;
    return entity;
  }
}
