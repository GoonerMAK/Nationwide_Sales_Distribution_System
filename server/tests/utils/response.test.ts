import { describe, expect, it, jest } from '@jest/globals';
import type { Response } from 'express';
import { sendCreated, sendDeleted, sendPaginated, sendSuccess } from '../../src/utils/response.js';

function mockResponse() {
  const json = jest.fn();
  const status = jest.fn().mockReturnValue({ json });
  return { res: { status } as unknown as Response, status, json };
}

describe('response helpers', () => {
  it('sendSuccess defaults to 200', () => {
    const { res, status, json } = mockResponse();

    sendSuccess(res, { id: '1' });

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ success: true, data: { id: '1' } });
  });

  it('sendSuccess honours a custom status code', () => {
    const { res, status } = mockResponse();

    sendSuccess(res, null, 202);

    expect(status).toHaveBeenCalledWith(202);
  });

  it('sendCreated responds 201', () => {
    const { res, status, json } = mockResponse();

    sendCreated(res, { id: '1' });

    expect(status).toHaveBeenCalledWith(201);
    expect(json).toHaveBeenCalledWith({ success: true, data: { id: '1' } });
  });

  it('sendPaginated includes pagination meta', () => {
    const { res, status, json } = mockResponse();
    const pagination = { offset: 0, limit: 10, hasMore: false };

    sendPaginated(res, [1, 2], pagination);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ success: true, data: [1, 2], pagination });
  });

  it('sendDeleted sends a message instead of data', () => {
    const { res, status, json } = mockResponse();

    sendDeleted(res, 'Area deleted');

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalledWith({ success: true, message: 'Area deleted' });
  });
});
