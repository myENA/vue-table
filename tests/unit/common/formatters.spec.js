import useFormatters from '@/components/common/formatters';
import '../setup';

const { heading, formatStr } = useFormatters();

describe('Formatters', () => {
  describe('formatStr ', () => {
    it('replaces all placeholders', () => {
      expect(formatStr('Some %s with %s', 'string', 'placeholders')).toBe('Some string with placeholders');
    });
  });
  describe('heading ', () => {
    it('first cases words without _', () => {
      expect(heading('column', {})).toBe('Column');
    });
    it('first cases words with camelCase', () => {
      expect(heading('columnName', {})).toBe('ColumnName');
    });
    it('first cases words with _', () => {
      expect(heading('column_name', {})).toBe('Column Name');
    });
    it('Uses provided heading', () => {
      expect(heading('column_name', { column_name: 'Custom' })).toBe('Custom');
    });
  });
});
