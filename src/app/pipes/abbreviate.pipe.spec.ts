import { AbbreviatePipe } from './abbreviate.pipe';

/**
 * Unit Test for Custom AbbreviatePipe (Experiment 12)
 * Tests abbreviation: "Sonal K Patel" -> "S.K.P."
 */
describe('AbbreviatePipe [Experiment 12]', () => {
  const pipe = new AbbreviatePipe();

  it('transforms "Sonal K Patel" to "S.K.P."', () => {
    expect(pipe.transform('Sonal K Patel')).toBe('S.K.P.');
  });

  it('transforms "Amit Shah" to "A.S."', () => {
    expect(pipe.transform('Amit Shah')).toBe('A.S.');
  });

  it('handles empty strings gracefully', () => {
    expect(pipe.transform('')).toBe('');
    expect(pipe.transform(null)).toBe('');
  });
});
