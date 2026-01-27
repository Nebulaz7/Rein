const { OpikClientService } = require('../feedback/feedback.service');

describe('OpikClientService', () => {
    let opikService;

    beforeEach(() => {
        opikService = new OpikClientService();
    });

    test('logFeedback should be defined', async () => {
        expect(opikService.logFeedback).toBeDefined();
    });

    test('endTrace should accept one argument', () => {
        expect(() => opikService.endTrace('traceId')).not.toThrow();
    });

    test('endTrace should accept two arguments', () => {
        expect(() => opikService.endTrace('traceId', 'success')).not.toThrow();
    });

    test('endTrace should accept three arguments', () => {
        expect(() => opikService.endTrace('traceId', 'error', new Error('Test error'))).not.toThrow();
    });
});