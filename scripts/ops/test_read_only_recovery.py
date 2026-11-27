import importlib.util
from pathlib import Path
import tempfile
import unittest

spec=importlib.util.spec_from_file_location('recovery',Path(__file__).with_name('read-only-recovery.py'))
recovery=importlib.util.module_from_spec(spec)
spec.loader.exec_module(recovery)

class ReadOnlyRecoveryTest(unittest.TestCase):
    def test_only_completed_archives_and_exact_get_are_allowed(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder)
            name='maplenpine-private-20261127T110343Z.tar.gz'
            (root/name).write_bytes(b'private test data')
            self.assertEqual(recovery.metadata(root),[])
            (root/(name+'.sha256')).write_text('a'*64+'  '+name)
            self.assertEqual(recovery.metadata(root)[0]['name'],name)
            self.assertEqual(recovery.requested_file('get '+name,root),root/name)
            for command in ['cat /etc/passwd','get ../.env','get '+name+';id','get '+name+' extra','index;id','']:
                with self.assertRaises(ValueError):recovery.requested_file(command,root)
            (root/name).unlink()
            (root/name).symlink_to('/etc/passwd')
            with self.assertRaises(ValueError):recovery.requested_file('get '+name,root)
            self.assertEqual(recovery.metadata(root),[])

if __name__=='__main__':unittest.main()
