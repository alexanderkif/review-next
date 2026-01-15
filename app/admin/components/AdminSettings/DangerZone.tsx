import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Trash2, AlertTriangle } from 'lucide-react';

interface DangerZoneProps {
  cleaningImages: boolean;
  clearing: boolean;
  onCleanImages: () => void;
  onClearDatabase: () => void;
}

export default function DangerZone({
  cleaningImages,
  clearing,
  onCleanImages,
  onClearDatabase,
}: DangerZoneProps) {
  return (
    <Card className="border-red-200">
      <CardHeader className="bg-red-50">
        <CardTitle className="flex items-center gap-2 text-red-700">
          <AlertTriangle size={20} />
          Danger Zone
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-6">
        <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
          <h4 className="mb-2 font-medium text-slate-800">Clean Unused Images</h4>
          <p className="mb-3 text-sm text-slate-700">
            Removes images from storage that are not referenced in the database.
          </p>
          <Button
            onClick={onCleanImages}
            disabled={cleaningImages}
            style={{ background: '#a16207', color: '#ffffff' }}
          >
            {cleaningImages ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Cleaning...
              </>
            ) : (
              <>
                <Trash2 size={16} className="mr-2" />
                Clean Unused Images
              </>
            )}
          </Button>
        </div>

        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <h4 className="mb-2 font-medium text-slate-800">Clear Database</h4>
          <p className="mb-3 text-sm text-slate-700">
            ⚠️ <strong>WARNING:</strong> This will delete ALL data from the database except admin
            users and reset it with sample data. This action CANNOT be undone!
          </p>
          <Button
            onClick={onClearDatabase}
            disabled={clearing}
            style={{ background: '#dc2626', color: '#ffffff' }}
          >
            {clearing ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Clearing...
              </>
            ) : (
              <>
                <Trash2 size={16} className="mr-2" />
                Clear Database
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
