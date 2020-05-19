import { expect } from 'chai';
import useFormatters from '@/components/common/formatters';

const { heading, formatStr } = useFormatters();

describe('Formatters', () => {
  describe('formatStr ', () => {
    it('replaces all placeholders', () => {
      expect(formatStr('Some %s with %s', 'string', 'placeholders')).to.eq('Some string with placeholders');
    });
  });
  describe('heading ', () => {
    it('first cases words without _', () => {
      expect(heading('column', {})).to.eq('Column');
    });
    it('first cases words with camelCase', () => {
      expect(heading('columnName', {})).to.eq('ColumnName');
    });
    it('first cases words with _', () => {
      expect(heading('column_name', {})).to.eq('Column Name');
    });
    it('Uses provided heading', () => {
      expect(heading('column_name', { column_name: 'Custom' })).to.eq('Custom');
    });
  });
});
