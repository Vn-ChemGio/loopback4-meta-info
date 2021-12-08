import {Entity, property} from '@loopback/repository';

/**
 * Abstract base class for all soft-delete enabled models
 *
 * @description
 * Base class for all soft-delete enabled models created.
 * It adds three attributes to the model class for handling soft-delete,
 * namely, 'deleted', deletedOn, deletedBy
 * Its an abstract class so no repository class should be based on this.
 */
export abstract class MetaEntity extends Entity {
  @property({
    type: 'number',
    required: false,
    defaultFn: 'FLOOR(EXTRACT(epoch FROM NOW()))',
    name: 'created_on',
    // jsonSchema: {
    //   nullable: true,
    // },
    postgresql: {
      columnName: 'created_on',
      dataType: 'bigint',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'YES',
    },
  })
  createdOn: number;

  @property({
    type: 'number',
    required: false,
    defaultFn: 'FLOOR(EXTRACT(epoch FROM NOW()))',
    name: 'updated_on',
    // jsonSchema: {
    //   nullable: true,
    // },
    postgresql: {
      columnName: 'updated_on',
      dataType: 'bigint',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'YES',
    },
  })
  updatedOn: number;

  @property({
    type: 'String',
    required: false,
    name: 'created_by',
    jsonSchema: {
      nullable: true,
    },
  })
  createdBy?: string;

  @property({
    type: 'String',
    required: false,
    name: 'updated_by',
    jsonSchema: {
      nullable: true,
    },
  })
  updatedBy?: string;

  @property({
    type: 'boolean',
    default: false,
  })
  deleted?: boolean;

  @property({
    type: 'number',
    name: 'deleted_on',
    // jsonSchema: {
    //   nullable: true,
    // },
    postgresql: {
      columnName: 'deleted_on',
      dataType: 'bigint',
      dataLength: null,
      dataPrecision: null,
      dataScale: null,
      nullable: 'YES',
    },
  })
  deletedOn?: number;

  @property({
    type: 'string',
    name: 'deleted_by',
    jsonSchema: {
      nullable: true,
    },
  })
  deletedBy?: string;

  constructor(data?: Partial<MetaEntity>) {
    super(data);
  }
}
