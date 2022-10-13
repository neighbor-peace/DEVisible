/* eslint-disable no-restricted-syntax */
import React, { useEffect, useState } from 'react';
import '../stylesheets/dashboard.css';
import { Grid, Box } from '@mui/material';
import { Link, Navigate } from 'react-router-dom';
import axios from 'axios';
import Footer from './Footer';
import RepoItem from './RepoItem';
import Loader from './Loader';
import { getUserDeps, getUserInfoApi } from './api/user';
import { GetUserInfo, OutOfSpecRepos, OutOfSpecDeps, User } from '../types';
import SearchBar from './SearchBar';
import findOutOfSpecRepos from './utils/findOutOfSpecRepos';

interface Props {
  user: User | null;
}

function Dashboard({ user }: Props): JSX.Element {
  const [data, setData] = useState<GetUserInfo[]>();
  const [loading, setLoading] = useState(true);
  const [outOfSpecRepos, setOutOfSpecRepos] = useState<OutOfSpecRepos>({});
  let repoOutOfSpecStatus: OutOfSpecDeps = {
    status: false,
    depsOutOfSpec: [],
  };
  useEffect(() => {
    if (!user) return;
    (async () => {
      const response = await getUserInfoApi();
      const [preferredDeps, allDependencies] = await getUserDeps();
      setOutOfSpecRepos(findOutOfSpecRepos(preferredDeps, allDependencies));
      setData(response);
      setLoading(false);
    })();
  }, [user]);
  // function for handling click of delete button within individual repo components
  const deleteRepo = async (repoId: number): Promise<void> => {
    // make axios delete request to server
    const deleteResponse = await axios.delete(`/webAPI/repo/${repoId}`);
    if (deleteResponse.status === 204 && data !== undefined) {
      const repoIndex = data.findIndex((repo) => repo.id === repoId);
      // store data state in a new label to be able to change it
      const newData = [...data];
      newData.splice(repoIndex, 1);
      // remove repo at the predetermined repoIndex that was found where repoId matched target repoId
      setData(newData);
    }
  };
  if (!user) return <Navigate to="/login" />;
  if (!loading && data?.length === 0)
    return (
      <div>
        <h2>No repos have been added yet!</h2>
        <p>
          To add a repo, grab your API key from{' '}
          <Link to="/account">the User Page</Link> and invoke the DEVisible
          application using it.
        </p>
      </div>
    );
  return (
    <>
      <Box overflow="auto" className="dashboard-container" flex={1}>
        <SearchBar />
        {loading ? (
          <Box className="loader-container">
            <Loader color="orange" />
          </Box>
        ) : (
          <Box overflow="auto" className="repo-tiles-grid">
            <Grid justifyContent="center" container>
              {data?.map((repo: GetUserInfo) => {
                if (outOfSpecRepos[repo.id]) {
                  repoOutOfSpecStatus = {
                    status: true,
                    depsOutOfSpec: outOfSpecRepos[repo.id],
                  };
                } else {
                  repoOutOfSpecStatus = {
                    status: false,
                    depsOutOfSpec: [],
                  };
                }
                return (
                  <RepoItem
                    repoOutOfSpecInfo={repoOutOfSpecStatus}
                    repoName={repo.name}
                    builds={repo.builds}
                    key={repo.id}
                    deleteRepo={deleteRepo}
                  />
                );
              })}
            </Grid>
          </Box>
        )}
      </Box>
      <Footer />
    </>
  );
}

export default Dashboard;
